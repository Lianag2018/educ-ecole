import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSupabaseClient} from '../server/supabase-client.mjs';

// Native Response objects, synthetic credentials and no network/provider calls.
const RPC = '/rest/v1/rpc/famille_reserve_voice';
const origin = 'https://school-fixture.supabase.co';
const payload = {p_parent:'fixture-parent',p_slot:'p1',p_id:'fixture-id',p_amount:10000,p_other:1000000};
function fixture(response) {
  const calls = [];
  const sb = createSupabaseClient({url:origin,key:'synthetic-service',anon:'synthetic-anon',fetcher:async (...args) => {
    calls.push(args);
    return typeof response === 'function' ? response(...args) : response;
  }});
  return {sb,calls};
}
const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});

test('regression: parsing a native successful HTTP 204 as JSON rejects',async () => {
  const response = new Response(null,{status:204});
  assert.equal(response.ok,true);
  await assert.rejects(response.json(),SyntaxError);
});

test('a successful POST to the SQL void budget RPC accepts HTTP 204 without JSON parsing',async () => {
  const response = new Response(null,{status:204});
  response.json = () => {throw Error('must_not_parse_204');};
  const {sb,calls} = fixture(response);
  assert.equal(await sb(RPC,payload),null);
  assert.equal(calls.length,1);
  const [url,options] = calls[0];
  assert.equal(url,origin+RPC);
  assert.equal(options.method,'POST');
  assert.deepEqual(JSON.parse(options.body),payload);
  assert.equal(options.redirect,'error');
  assert.ok(options.signal instanceof AbortSignal);
  assert.deepEqual(options.headers,{apikey:'synthetic-service',Authorization:'Bearer synthetic-service','Content-Type':'application/json'});
});

for(const value of [null,'']) test(`legacy HTTP 200 JSON ${JSON.stringify(value)} remains accepted`,async () => {
  const {sb,calls} = fixture(json(value));
  assert.equal(await sb(RPC,payload),value);
  assert.equal(calls.length,1);
});

for(const [path,body] of [
  [RPC,null],
  [RPC+'?select=*',payload],
  ['/rest/v1/rpc/famille_save_plan',{p_plan:{}}],
  ['/auth/v1/token?grant_type=password',{email:'parent@example.invalid',password:'synthetic-password'}],
  ['/auth/v1/user',null],
  ['/rest/v1/famille_voice_profiles?select=stage',null],
]) test(`unexpected HTTP 204 stays an error for ${body?'POST':'GET'} ${path}`,async () => {
  const {sb,calls} = fixture(new Response(null,{status:204}));
  await assert.rejects(sb(path,body),/^Error: backend_unavailable$/);
  assert.equal(calls.length,1);
});

for(const text of ['', ' ', '<html>upstream_error</html>']) test(`invalid successful JSON ${JSON.stringify(text)} is not accepted as a budget reservation`,async () => {
  const {sb,calls} = fixture(new Response(text,{status:200}));
  await assert.rejects(sb(RPC,payload),/^Error: backend_unavailable$/);
  assert.equal(calls.length,1);
});

test('budget rate limiting remains distinct and is never retried',async () => {
  const {sb,calls} = fixture(json({message:'rate_limit',details:'synthetic-private-detail'},400));
  await assert.rejects(sb(RPC,payload),/^Error: rate_limit$/);
  assert.equal(calls.length,1);
});

for(const status of [401,403,429,500,503]) test(`HTTP ${status} cannot become a successful reservation`,async () => {
  const {sb,calls} = fixture(json({message:'synthetic-private-detail'},status));
  await assert.rejects(sb(RPC,payload),/^Error: backend_unavailable$/);
  assert.equal(calls.length,1);
});

test('a non-JSON upstream error remains closed without leaking its response',async () => {
  const {sb,calls} = fixture(new Response('synthetic-private-detail',{status:503}));
  await assert.rejects(sb(RPC,payload),/^Error: backend_unavailable$/);
  assert.equal(calls.length,1);
});

test('JSON auth, profiles and saved-plan responses keep their existing values and credentials',async () => {
  const values=[{access_token:'synthetic-jwt',user:{id:'fixture-parent'}},{id:'fixture-parent'},[{stage:'1re année'}],{}];
  let index=0;
  const {sb,calls}=fixture(()=>json(values[index++]));
  assert.deepEqual(await sb('/auth/v1/token?grant_type=password',{email:'parent@example.invalid',password:'synthetic-password'}),values[0]);
  assert.deepEqual(await sb('/auth/v1/user',null,'synthetic-jwt'),values[1]);
  assert.deepEqual(await sb('/rest/v1/famille_voice_profiles?select=stage'),values[2]);
  assert.deepEqual(await sb('/rest/v1/rpc/famille_save_plan',{p_plan:{}}),values[3]);
  assert.equal(calls[0][1].headers.apikey,'synthetic-anon');
  assert.equal(calls[1][1].headers.apikey,'synthetic-service');
  assert.equal(calls[1][1].headers.Authorization,'Bearer synthetic-jwt');
  assert.equal(calls[1][1].method,'GET');
  assert.equal('body' in calls[1][1],false);
  assert.equal(calls.length,4);
});

test('network failure after a possible commit is not retried or refunded',async () => {
  const {sb,calls}=fixture(()=>{throw Error('synthetic_connection_lost');});
  await assert.rejects(sb(RPC,payload),/^Error: synthetic_connection_lost$/);
  assert.equal(calls.length,1);
});

test('runtime uses this tested adapter and retains its budget-error boundary',() => {
  const source=readFileSync(new URL('../server/runtime.mjs',import.meta.url),'utf8');
  assert.match(source,/import \{createSupabaseClient\} from '\.\/supabase-client\.mjs';/);
  assert.match(source,/const sb=createSupabaseClient\(\{url,key,anon,fetcher\}\);/);
  assert.doesNotMatch(source,/async function sb\(/);
  assert.ok(source.includes("throw Error(e.message==='rate_limit'?'rate_limit':'budget_unavailable')"));
});

test('production build runs the regression suite before generating or publishing assets',() => {
  const pkg=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8'));
  assert.equal(pkg.scripts.build,'node ops/test.mjs && node ops/build.mjs');
});
