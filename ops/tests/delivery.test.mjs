import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm, symlink, readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {runVercel, staticFiles} from '../educ-ecole-vercel.mjs';
import {auditSupabase} from '../audit-supabase.mjs';
import {api} from '../http.mjs';
const token = 'synthetic-test-token';
const project = {id: 'prj_family', name: 'educ-ecole-famille', accountId: 'team_family'};
const team = {id: 'team_family', slug: 'lianag2018s-projects', billing: {plan: 'hobby'}};
function mock({username = 'lianag2018', plan = 'hobby', existing = project, state = 'READY', deploymentTarget = null} = {}) {
  const calls = [];
  const fetcher = async (url, options) => {
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    assert.equal(options.redirect, 'error');
    const path = new URL(url).pathname;
    calls.push({path, method: options.method, body: options.body && JSON.parse(options.body)});
    let data;
    if (path === '/v2/user') data = {user: {username}};
    else if (path === '/v2/teams') data = {teams: [team]};
    else if (path === '/v2/teams/team_family') data = {...team, billing: {plan}};
    else if (path.startsWith('/v9/projects/')) {
      if (!existing) return new Response('{}', {status: 404});
      data = existing;
    } else if (path === '/v11/projects') data = project;
    else if (path.startsWith('/v13/deployments')) data = {id: 'dpl_test', readyState: state, target: deploymentTarget, url: 'educ-ecole-famille-test.vercel.app'};
    else throw Error('unexpected_endpoint');
    if (path.includes('projects') || path.includes('deployments')) assert.equal(new URL(url).searchParams.get('teamId'), team.id);
    return Response.json(data);
  };
  return {calls, fetcher};
}
const loadFiles = async () => [{file: 'index.html', data: 'ok', encoding: 'base64'}];
test('default audit is read-only even if project is absent', async () => {
  const {calls, fetcher} = mock({existing: null});
  const result = await runVercel({token, fetcher});
  assert.equal(result.mode, 'audit');
  assert.equal(result.project, 'absent');
  assert.ok(calls.every(c => c.method === 'GET'));
});
test('identity, plan, resource linkage and production guards fail before mutation', async () => {
  for (const options of [{username: 'other'}, {plan: 'pro'}, {existing: {...project, accountId: 'other'}},
    {existing: {...project, link: {type: 'github'}}}, {existing: {...project, env: [{key: 'PRIVATE'}]}},
    {existing: {...project, targets: {production: {id: 'old'}}}}]) {
    const {calls, fetcher} = mock(options);
    await assert.rejects(runVercel({token, mode: 'preview-static', fetcher, loadFiles}));
    assert.ok(calls.every(c => c.method === 'GET'));
  }
});
test('explicit preview creates only dedicated project then preview with static files and no environment', async () => {
  const {calls, fetcher} = mock({existing: null});
  const result = await runVercel({token, mode: 'preview-static', fetcher, loadFiles});
  assert.equal(result.state, 'READY');
  const writes = calls.filter(c => c.method !== 'GET');
  assert.deepEqual(writes.map(c => c.path), ['/v11/projects', '/v13/deployments']);
  const body = writes[1].body;
  assert.equal(body.project, project.id);
  for (const key of ['target', 'env', 'build', 'gitSource', 'alias']) assert.equal(Object.hasOwn(body, key), false);
  assert.deepEqual(body.files, await loadFiles());
  assert.ok(!JSON.stringify(body).includes(token));
});
test('invalid mode, missing token, missing build fail closed', async () => {
  await assert.rejects(runVercel({token, mode: 'production'}), /mode_denied/);
  await assert.rejects(runVercel({}), /token_missing/);
  const {calls, fetcher} = mock();
  await assert.rejects(runVercel({token, mode: 'preview-static', fetcher, loadFiles: async () => {throw Error('missing');}}));
  assert.equal(calls.length, 0);
});
test('preview remote failure/production response and polling timeout fail closed', async () => {
  for (const options of [{state: 'ERROR'}, {deploymentTarget: 'production'}, {state: 'BUILDING'}]) {
    const {fetcher} = mock(options);
    await assert.rejects(runVercel({token, mode: 'preview-static', fetcher, loadFiles, pause: async () => {}}));
  }
});
test('only build index/src assets can be uploaded; reject symlinks/config', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'famille-static-'));
  const root = pathToFileURL(dir + '/');
  try {
    await mkdir(join(dir, 'src'));
    await writeFile(join(dir, 'index.html'), 'hello');
    await writeFile(join(dir, 'src/app.js'), 'ok');
    assert.equal((await staticFiles(root)).length, 2);
    await writeFile(join(dir, '.env'), 'fixture');
    await assert.rejects(staticFiles(root), /static_file_denied/);
    await rm(join(dir, '.env'));
    await symlink(join(dir, 'index.html'), join(dir, 'src/other.js'));
    await assert.rejects(staticFiles(root), /static_symlink_denied/);
  } finally { await rm(dir, {recursive: true, force: true}); }
});
test('HTTP errors are neutral; no token or remote body in exceptions', async () => {
  for (const status of [401, 403, 429, 500]) {
    await assert.rejects(api('https://example.invalid', token, async () => new Response(token, {status}))('/path'), new RegExp(`^Error: http_${status}$`));
  }
  await assert.rejects(api('https://example.invalid', token, async () => {throw Error(token);})('/path'), /network_error/);
});
test('Supabase uses only explicit project metadata endpoint; no API keys/list/writes', async () => {
  const ref = 'abcdefghijklmnopqrst', calls = [];
  const result = await auditSupabase({token, ref, fetcher: async (url, opts) => {
    calls.push(url); assert.equal(opts.method, 'GET');
    return Response.json({id: ref, name: "danielgiroux007@gmail.com's Project", organization_id: 'org-personal', region: 'ca-central-1', status: 'ACTIVE_HEALTHY', api_keys: ['never-output']});
  }});
  assert.deepEqual(calls, [`https://api.supabase.com/v1/projects/${ref}`]);
  assert.equal(result.identity_confirmed, false);
  assert.ok(!JSON.stringify(result).includes('never-output'));
  await assert.rejects(auditSupabase({token, ref: '../api-keys'}), /project_ref_required/);
  await assert.rejects(auditSupabase({token, ref, fetcher: async () => Response.json({id: ref, name: 'Luxura'})}), /project_identity_mismatch/);
  await assert.rejects(auditSupabase({token, ref, fetcher: async () => new Response('sensitive', {status: 403})}), /http_403/);
});
test('workflow secrets are step-local; build/test precedes secret jobs, no uploads or automated dispatch', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/educ-ecole-vercel.yml', import.meta.url), 'utf8');
  assert.match(workflow, /default: audit/);
  assert.match(workflow, /- preview-static/);
  assert.match(workflow, /- audit-supabase/);
  assert.equal((workflow.match(/needs: verify/g) || []).length, 2);
  assert.equal((workflow.match(/secrets\.EDUC_ECOLE_VERCEL/g) || []).length, 1);
  assert.equal((workflow.match(/secrets\.EDUC_ECOLE_SUPABASE/g) || []).length, 1);
  assert.doesNotMatch(workflow, /pull_request|push:|schedule:|upload-artifact|secrets: inherit/);
});
