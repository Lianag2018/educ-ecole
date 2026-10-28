import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from '../server/runtime.mjs';
import {provisionParent} from '../server/parent-activation.mjs';
const id='11111111-1111-4111-8111-111111111111',hash='a'.repeat(64);
const jwt=(age=0)=>'header.'+Buffer.from(JSON.stringify({iat:Date.now()/1000-age})).toString('base64url')+'.signature';
const env={EDUC_ORIGIN:'https://school.example',EDUC_PARENT_ID:id,SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_fixture',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',EDUC_VOICE_CONFIG:'{"learningEnabled":true}'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function harness(){
 const calls=[],devices=new Map();let used=false,rejectPassword=false;
 const user={id,email_confirmed_at:'2026-01-01',is_anonymous:false};
 const fetcher=async(url,init)=>{
  const path=new URL(url).pathname,b=init.body?JSON.parse(init.body):undefined;calls.push({url,init,b});
  if(path==='/auth/v1/verify'){if(used||b.token_hash!==hash)return json({},401);used=true;return json({user,access_token:jwt()});}
  if(path==='/auth/v1/user'){if(init.method==='PUT'&&rejectPassword)return json({},422);return json(user);}
  if(path==='/auth/v1/token')return json({user,access_token:jwt()});
  if(path==='/rest/v1/rpc/famille_register_device'){if(b.p_previous)devices.delete(b.p_previous);devices.set(b.p_digest,{parent_id:b.p_parent,expires:Date.now()+7776000000});return json(true);}
  if(path==='/rest/v1/rpc/famille_revoke_devices'){for(const [k,v]of devices)if(v.parent_id===b.p_parent&&(!b.p_digest||b.p_digest===k))devices.delete(k);return json(true);}
  if(path==='/rest/v1/famille_devices'){const q=new URL(url).searchParams,k=q.get('token_hash').slice(3),d=devices.get(k);return json(d&&d.parent_id===q.get('parent_id').slice(3)&&d.expires>Date.now()?[{parent_id:d.parent_id}]:[]);}
  if(path==='/rest/v1/famille_voice_profiles')return json([{stage:new URL(url).searchParams.get('profile_slot')==='eq.p1'?'1re année':'3e année'}]);
  if(path==='/rest/v1/famille_school_plans')return json([]);
  if(path==='/rest/v1/rpc/famille_sync_learning')return json({events:[],cursor:0,more:false});
  throw Error('unexpected_fixture_call '+path);
 };
 const app=runtime(env,fetcher);
 const req=(path,body={},cookie='',origin=env.EDUC_ORIGIN)=>app({path,method:'POST',headers:{origin,cookie},body});
 return {req,calls,devices,user,set rejectPassword(v){rejectPassword=v;},get used(){return used;}};
}
const parentCookie=()=>`educ_parent=${jwt()}`;
const tokenCookie=result=>result.headers['Set-Cookie'].split(';')[0];

test('an invitation sets a password with the public key and keeps all session tokens out of JSON',async()=>{
 const h=harness(),r=await h.req('/api/parent/activate',{tokenHash:hash,password:'long synthetic password',rememberDevice:true});
 assert.equal(r.status,200);assert.equal(r.body.deviceEnabled,true);assert.equal(h.devices.size,1);
 assert.equal(h.calls[0].init.headers.apikey,'sb_publishable_fixture');
 const change=h.calls.find(c=>c.init.method==='PUT');assert.equal(change.init.headers.apikey,'sb_publishable_fixture');assert.match(change.init.headers.Authorization,/^Bearer /);
 assert.equal(r.headers['Set-Cookie'].length,3);assert.ok(r.headers['Set-Cookie'].every(c=>c.includes('HttpOnly; Secure; SameSite=Strict')));
 assert.doesNotMatch(JSON.stringify(r.body),/header\.|signature|long synthetic|token/i);
 assert.equal((await h.req('/api/parent/activate',{tokenHash:hash,password:'long synthetic password'})).status,401);
});
test('bad origin, invalid fields and short passwords do not consume the invitation',async()=>{
 for(const [body,origin]of [[{tokenHash:hash,password:'long synthetic password'},'https://other.example'],[{tokenHash:hash,password:'short'},env.EDUC_ORIGIN],[{tokenHash:hash,password:'long synthetic password',email:'other@example.test'},env.EDUC_ORIGIN]]){
  const h=harness();assert.ok((await h.req('/api/parent/activate',body,'',origin)).status>=400);assert.equal(h.calls.length,0);
 }
});
test('a provider password rejection permits a bounded retry without consuming a second invitation',async()=>{
 const h=harness();h.rejectPassword=true;
 const first=await h.req('/api/parent/activate',{tokenHash:hash,password:'long synthetic password'});
 assert.equal(first.status,422);assert.match(first.headers['Set-Cookie'],/^educ_activation=/);
 h.rejectPassword=false;
 const retry=await h.req('/api/parent/activate',{tokenHash:hash,password:'another long password'},tokenCookie(first));
 assert.equal(retry.status,200);assert.equal(h.calls.filter(c=>c.url.endsWith('/verify')).length,1);
 assert.equal((await h.req('/api/parent/activate',{tokenHash:hash,password:'another long password'},'educ_activation='+jwt(601))).status,401);
});
test('an invitation for another or anonymous account cannot update its password or create a device',async()=>{
 for(const changes of [{id:'another-parent'},{is_anonymous:true},{email_confirmed_at:null}]){
  const h=harness();Object.assign(h.user,changes);
  assert.equal((await h.req('/api/parent/activate',{tokenHash:hash,password:'long synthetic password',rememberDevice:true})).status,403);
  assert.equal(h.calls.length,1);assert.equal(h.devices.size,0);
 }
});
test('device access saves each child after parent expiration without gaining parent powers',async()=>{
 const h=harness(),enabled=await h.req('/api/parent/device/enable',{},parentCookie());
 assert.equal(enabled.status,200);const cookie=tokenCookie(enabled)+'; educ_parent='+jwt(3601);
 assert.match(enabled.headers['Set-Cookie'],/Max-Age=7776000/);
 for(const profileId of ['p1','p2']){
  const result=await h.req('/api/learning/sync',{profileId,events:[],after:0},cookie);
  assert.equal(result.status,200);assert.equal(result.body.canEvolve,false);
  assert.equal((await h.req('/api/plans/list',{profileId},cookie)).status,200);
 }
 for(const path of ['/api/plans/import','/api/learning/evolve','/api/parent/device/enable','/api/voice/turn','/api/voice/check'])assert.equal((await h.req(path,path.endsWith('/enable')?{}:{profileId:'p1'},cookie)).status,401,path);
 assert.equal((await h.req('/api/parent/device/revoke',{all:true},cookie)).status,401);
 const status=await h.req('/api/voice/status',{},cookie);assert.equal(status.body.authenticated,false);
 const writes=h.calls.filter(c=>c.url.endsWith('famille_sync_learning'));assert.deepEqual(writes.map(c=>c.b.p_slot),['p1','p2']);assert.ok(writes.every(c=>c.b.p_parent===id));
 const raw=tokenCookie(enabled).slice('educ_device='.length);assert.ok(!JSON.stringify(h.calls).includes(raw));
});
test('expired, revoked, foreign and cross-origin device credentials cannot sync',async()=>{
 for(const mode of ['expired','revoked','foreign','origin']){
  const h=harness(),enabled=await h.req('/api/parent/device/enable',{},parentCookie()),cookie=tokenCookie(enabled),record=[...h.devices.values()][0];
  if(mode==='expired')record.expires=0;if(mode==='foreign')record.parent_id='another-parent';if(mode==='revoked')h.devices.clear();
  assert.equal((await h.req('/api/learning/sync',{profileId:'p1',events:[],after:0},cookie,mode==='origin'?'https://other.example':env.EDUC_ORIGIN)).status,401,mode);
 }
});
test('a device can revoke itself; only a fresh parent can revoke all devices',async()=>{
 const h=harness(),first=await h.req('/api/parent/device/enable',{},parentCookie()),second=await h.req('/api/parent/device/enable',{},parentCookie());
 assert.equal(h.devices.size,2);assert.equal((await h.req('/api/parent/device/revoke',{},tokenCookie(first))).status,200);assert.equal(h.devices.size,1);
 assert.equal((await h.req('/api/parent/device/status',{},tokenCookie(second))).body.enabled,true);
 assert.equal((await h.req('/api/parent/device/revoke',{all:true},parentCookie())).status,200);assert.equal(h.devices.size,0);
});
test('parent logout preserves only the explicitly enabled device grant',async()=>{
 const h=harness(),enabled=await h.req('/api/parent/device/enable',{},parentCookie());
 const logout=await h.req('/api/parent/logout',{},parentCookie()+'; '+tokenCookie(enabled));
 assert.equal(logout.status,200);assert.match(logout.headers['Set-Cookie'],/^educ_parent=.*Max-Age=0/);assert.doesNotMatch(logout.headers['Set-Cookie'],/educ_device/);assert.equal(h.devices.size,1);
});
test('provisioning is one-use, target-bound, short-lived and does not auto-confirm email',async()=>{
 const setup={...env,SUPABASE_URL:'https://legkfinwvtyavynngoea.supabase.co',EDUC_ORIGIN:'https://educ-ecole.vercel.app',VERCEL_ENV:'production',VERCEL_PROJECT_ID:'prj_pxl5Jmoxwmgvtp9zDUXxvIGFFxo2',EDUC_PARENT_SETUP_TOKEN:'a'.repeat(43),EDUC_PARENT_SETUP_EMAIL:'fixture@example.invalid',EDUC_PARENT_SETUP_EXPIRES:new Date(Date.now()+600000).toISOString()};
 const req={method:'POST',headers:{origin:setup.EDUC_ORIGIN,authorization:'Bearer '+setup.EDUC_PARENT_SETUP_TOKEN},body:{}};let claimed=false;const calls=[];
 const sb=async(path,body)=>{calls.push({path,body});if(path.endsWith('famille_claim_parent_setup')){if(claimed)return false;claimed=true;return true;}if(path.includes('admin/users'))return {users:[]};return {id,email:setup.EDUC_PARENT_SETUP_EMAIL,verification_type:'invite',hashed_token:hash};};
 const r=await provisionParent(req,{env:setup,sb});assert.equal(r.status,200);assert.equal(r.body.activationUrl,'https://educ-ecole.vercel.app/activation.html#token='+hash);
 assert.deepEqual(calls.at(-1).body,{type:'invite',email:'fixture@example.invalid'});
 assert.equal((await provisionParent(req,{env:setup,sb})).status,409);
 for(const patch of [{VERCEL_ENV:'preview'},{VERCEL_PROJECT_ID:'other'},{SUPABASE_URL:'https://other.supabase.co'},{EDUC_PARENT_SETUP_TOKEN:''},{EDUC_PARENT_SETUP_EXPIRES:new Date(Date.now()-100).toISOString()},{EDUC_PARENT_SETUP_EXPIRES:new Date(Date.now()+7200000).toISOString()}])assert.equal((await provisionParent(req,{env:{...setup,...patch},sb:()=>{throw Error('must not call');}})).status,404);
});
