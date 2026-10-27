import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from '../server/runtime.mjs';
import {createSupabaseClient} from '../server/supabase-client.mjs';

// Synthetic project/keys/parent only. No network or provider calls.
const integration = {
  SUPABASE_URL: 'https://fixture.supabase.co',
  SUPABASE_SECRET_KEY: 'sb_secret_synthetic_fixture',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic_fixture',
};
const parent = {EDUC_ORIGIN: 'https://school.example', EDUC_PARENT_ID: 'fixture-parent'};
const request = {path: '/api/voice/status', method: 'GET', headers: {}};
const noFetch = () => {throw Error('unexpected_network');};
const json = body => new Response(JSON.stringify(body), {headers: {'Content-Type': 'application/json'}});

test('Vercel integration config enables parent configuration without enabling paid services', async () => {
  const result = await runtime({...integration, ...parent}, noFetch)(request);
  assert.equal(result.body.authConfigured, true);
  assert.equal(result.body.authenticated, false);
  assert.equal(result.body.available, false);
  assert.equal(result.body.oralCheckAvailable, false);
  for (const value of Object.values(integration)) assert.ok(!JSON.stringify(result).includes(value));
});

test('integration still needs the real parent and exact HTTPS origin', async () => {
  for (const key of ['EDUC_ORIGIN', 'EDUC_PARENT_ID', ...Object.keys(integration)]) {
    const env = {...integration, ...parent}; delete env[key];
    assert.equal((await runtime(env, noFetch)(request)).body.authConfigured, false, key);
    assert.equal((await runtime(env, noFetch)({path:'/api/parent/login', method:'POST', headers:{}, body:{}})).status, 503);
  }
  for (const origin of ['http://school.example', 'https://school.example/elsewhere']) {
    assert.equal((await runtime({...integration, ...parent, EDUC_ORIGIN: origin}, noFetch)(request)).body.authConfigured, false);
  }
});

test('partial explicit configuration never borrows integration keys from another project', async () => {
  for (const partial of [
    {EDUC_SUPABASE_URL:'https://other-fixture.supabase.co'},
    {EDUC_SUPABASE_SERVICE_KEY:'synthetic-other'},
    {EDUC_SUPABASE_ANON_KEY:''},
  ]) {
    const app = runtime({...integration, ...parent, ...partial}, noFetch);
    assert.equal((await app(request)).body.authConfigured, false);
    assert.equal((await app({path:'/api/parent/login', method:'POST', headers:{}, body:{}})).status, 503);
  }
});

test('explicit EDU configuration stays authoritative when integration targets another project', async () => {
  const calls=[];
  const app=runtime({...integration, ...parent, EDUC_SUPABASE_URL:'https://explicit-fixture.supabase.co',
    EDUC_SUPABASE_SERVICE_KEY:'synthetic-service', EDUC_SUPABASE_ANON_KEY:'synthetic-anon'}, async (url, init) => {
    calls.push([url, init]); return json({user:{id:parent.EDUC_PARENT_ID,email_confirmed_at:'2026-01-01'},access_token:'synthetic-user-token'});
  });
  assert.equal((await app({path:'/api/parent/login',method:'POST',headers:{origin:parent.EDUC_ORIGIN},body:{email:'parent@example.invalid',password:'synthetic-password'}})).status,200);
  assert.equal(calls.length,1);
  assert.equal(calls[0][0],'https://explicit-fixture.supabase.co/auth/v1/token?grant_type=password');
  assert.equal(calls[0][1].headers.apikey,'synthetic-anon');
});

test('legacy integration names are supported as a complete alternative only', async () => {
  const env={...parent,SUPABASE_URL:integration.SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:'synthetic-legacy-service',SUPABASE_ANON_KEY:'synthetic-legacy-anon'};
  assert.equal((await runtime(env,noFetch)(request)).body.authConfigured,true);
  for (const partial of [{SUPABASE_SECRET_KEY:integration.SUPABASE_SECRET_KEY},{SUPABASE_PUBLISHABLE_KEY:''}]) {
    assert.equal((await runtime({...env,...partial},noFetch)(request)).body.authConfigured,false);
  }
});

test('opaque keys use apikey, with a user JWT only for authenticated requests', async () => {
  const calls=[];
  const sb=createSupabaseClient({url:integration.SUPABASE_URL,key:integration.SUPABASE_SECRET_KEY,anon:integration.SUPABASE_PUBLISHABLE_KEY,
    fetcher:async(url,init)=>{calls.push([url,init]);return json({});}});
  await sb('/auth/v1/token?grant_type=password',{email:'parent@example.invalid',password:'synthetic-password'});
  await sb('/auth/v1/user',null,'synthetic-parent-jwt');
  await sb('/rest/v1/famille_voice_profiles?select=stage');
  assert.equal(calls[0][1].headers.apikey,integration.SUPABASE_PUBLISHABLE_KEY);
  assert.equal('Authorization' in calls[0][1].headers,false);
  assert.equal(calls[1][1].headers.apikey,integration.SUPABASE_PUBLISHABLE_KEY);
  assert.equal(calls[1][1].headers.Authorization,'Bearer synthetic-parent-jwt');
  assert.equal(calls[2][1].headers.apikey,integration.SUPABASE_SECRET_KEY);
  assert.equal('Authorization' in calls[2][1].headers,false);
});

test('runtime with integration retains origin, parent identity and verification requirements', async () => {
  for (const user of [{id:'another-parent',email_confirmed_at:'2026-01-01'},{id:parent.EDUC_PARENT_ID}]) {
    const app=runtime({...integration,...parent},async()=>json({user,access_token:'synthetic-user-token'}));
    assert.equal((await app({path:'/api/parent/login',method:'POST',headers:{origin:parent.EDUC_ORIGIN},body:{email:'parent@example.invalid',password:'synthetic-password'}})).status,401);
  }
  const app=runtime({...integration,...parent},noFetch);
  assert.equal((await app({path:'/api/parent/login',method:'POST',headers:{origin:'https://other.example'},body:{}})).status,403);
});
