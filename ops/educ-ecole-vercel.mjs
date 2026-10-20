import {pathToFileURL} from 'node:url';
import {readdir, readFile, lstat} from 'node:fs/promises';
import {api, requireValue, neutralError} from './http.mjs';

const USER = 'lianag2018', TEAM = 'lianag2018s-projects', PROJECT = 'educ-ecole-famille';
export async function staticFiles(root = new URL('../dist/', import.meta.url)) {
  const files = [];
  async function walk(dir, prefix = '') {
    for (const name of await readdir(dir)) {
      const file = prefix + name, url = new URL(name, dir), stat = await lstat(url);
      requireValue(!stat.isSymbolicLink(), 'static_symlink_denied');
      if (stat.isDirectory()) {
        requireValue(['src','icons'].includes(file), 'static_directory_denied');
        await walk(new URL(name + '/', dir), file + '/');
      } else {
        requireValue(['index.html','manifest.webmanifest'].includes(file) || /^icons\/[a-z0-9-]+\.png$/.test(file) || /^src\/[a-z-]+\.(js|css)$/.test(file), 'static_file_denied');
        files.push({file, data: (await readFile(url)).toString('base64'), encoding: 'base64'});
      }
    }
  }
  await walk(root);
  requireValue(files.some(f => f.file === 'index.html') && files.length > 1, 'build_missing');
  return files;
}
function checkProject(project, teamId) {
  requireValue(project?.name === PROJECT && project.accountId === teamId && typeof project.id === 'string', 'project_identity_mismatch');
  requireValue(!project.link && !project.env?.length && !project.targets?.production, 'project_not_dedicated');
}
export async function runVercel({token, mode = 'audit', fetcher, loadFiles = staticFiles, pause = ms => new Promise(r => setTimeout(r, ms))}) {
  requireValue(['audit', 'preview-static'].includes(mode), 'mode_denied');
  // Validate build before any resource mutation.
  const files = mode === 'preview-static' ? await loadFiles() : null;
  const request = api('https://api.vercel.com', token, fetcher);
  const {user} = await request('/v2/user');
  requireValue(user?.username === USER, 'user_identity_mismatch');
  const {teams} = await request('/v2/teams?limit=100');
  const candidate = teams?.find(t => t.slug === TEAM);
  requireValue(typeof candidate?.id === 'string', 'team_not_accessible');
  const team = await request(`/v2/teams/${encodeURIComponent(candidate.id)}`);
  requireValue(team.slug === TEAM && team.billing?.plan === 'hobby' && typeof team.id === 'string', 'team_or_plan_mismatch');
  const scope = `?teamId=${encodeURIComponent(team.id)}`;
  let project = await request(`/v9/projects/${PROJECT}${scope}`, {allow404: true});
  if (project) checkProject(project, team.id);
  if (mode === 'audit') return {username: USER, team: TEAM, plan: 'hobby', project: project ? PROJECT : 'absent', mode};
  if (!project) {
    project = await request(`/v11/projects${scope}`, {method: 'POST', body: {
      name: PROJECT, framework: null, buildCommand: '', installCommand: '',
      autoAssignCustomDomains: false,
    }});
    checkProject(project, team.id);
  }
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url)));
  // No git source, env, aliases, functions or target=production. Omitted target is
  // preview per Vercel REST API; "preview" is not a valid explicit target value.
  let deployment = await request(`/v13/deployments${scope}`, {method: 'POST', body: {
    name: PROJECT, project: project.id, files,
    projectSettings: {framework: null, buildCommand: '', installCommand: '', outputDirectory: '.'},
    routes: [{src: '/(.*)', headers: Object.fromEntries(config.headers[0].headers.map(h => [h.key, h.value]))}],
  }});
  requireValue(/^dpl_[a-zA-Z0-9]+$/.test(deployment.id || ''), 'deployment_id_invalid');
  const id = deployment.id;
  for (let attempt = 0; attempt < 60; attempt++) {
    requireValue(deployment.target == null || deployment.target === 'preview', 'unexpected_deployment_target');
    requireValue(!['ERROR', 'CANCELED'].includes(deployment.readyState), 'preview_failed');
    if (deployment.readyState === 'READY') {
      requireValue(/^[a-zA-Z0-9-]+\.vercel\.app$/.test(deployment.url || ''), 'preview_url_invalid');
      return {username: USER, team: TEAM, plan: 'hobby', project: PROJECT, mode, url: `https://${deployment.url}`, state: 'READY'};
    }
    await pause(3000);
    deployment = await request(`/v13/deployments/${id}${scope}`);
  }
  throw new Error('timeout');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runVercel({token: process.env.EDUC_ECOLE_VERCEL, mode: process.env.EDUC_MODE || 'audit'})
    .then(result => console.log(JSON.stringify(result))).catch(neutralError);
}
