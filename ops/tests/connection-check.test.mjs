import test from 'node:test';
import assert from 'node:assert/strict';
import {checkConnections,checkProductionConnections} from '../check-connections.mjs';
const env={EDUC_ORIGIN:'https://educ-ecole.vercel.app',SUPABASE_URL:'https://legkfinwvtyavynngoea.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_fixture',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',EDUC_OPENAI_API_KEY:'synthetic-private-key'};
const json=data=>new Response(JSON.stringify(data));
const success=async(url,init)=>url.includes('/models/')?json({id:'gpt-4.1-mini-2025-04-14'}):url.endsWith('/rest/v1/')?json({paths:{'/rpc/famille_reserve_voice':{post:{}},'/rpc/famille_save_plan':{post:{}}}}):init.method==='HEAD'?new Response(null):json({});

test('live connection audit is read-only and reports access without claiming photo success',async()=>{
 const calls=[];
 const report=await checkConnections({env,fetcher:async(url,init)=>{calls.push({url,init});return success(url,init);}});
 assert.equal(report.openai,'model_access_verified');assert.equal(report.supabase,'auth_reachable');assert.equal(report.rpcMetadata,'present');
 assert.equal(report.parent,'not_configured');assert.equal(report.photoWorkflowVerified,false);
 assert.equal(report.privacyConfigured,false);assert.equal(report.plansEnabled,false);
 assert.equal(calls.length,7);assert.equal(calls.filter(c=>c.init.method==='HEAD').length,4);
 for(const c of calls){assert.ok(['GET','HEAD'].includes(c.init.method));assert.equal(c.init.body,undefined);assert.equal(c.init.redirect,'error');}
 for(const value of Object.values(env))assert.ok(!JSON.stringify(report).includes(value));
 assert.ok(!calls.some(c=>c.url.includes('admin/users')));
});

test('never sends credentials outside the verified family target or an incomplete config family',async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error('unexpected');};
 for(const changed of [{EDUC_ORIGIN:'https://elsewhere.example'},{SUPABASE_URL:'https://other.supabase.co'}]){
  assert.equal((await checkConnections({env:{...env,...changed},fetcher})).scope,'target_mismatch');
 }
 assert.equal(calls,0);
 const urls=[];const report=await checkConnections({env:{...env,EDUC_SUPABASE_SERVICE_KEY:'partial'},fetcher:async(url,init)=>{urls.push(url);return success(url,init);}});
 assert.equal(report.supabase,'not_configured');assert.equal(urls.length,1);assert.ok(urls[0].startsWith('https://api.openai.com/'));
});

test('credential failures, missing schemas and provider bodies cannot become successful or leak',async()=>{
 const report=await checkConnections({env,fetcher:async(url,init)=>new Response('secret-do-not-display',{status:url.includes('openai.com')?401:404})});
 assert.equal(report.openai,'credentials_rejected');assert.equal(report.supabase,'not_found');assert.equal(report.rpcMetadata,'not_found');
 assert.ok(Object.values(report.tables).every(x=>x==='not_found'));assert.ok(!JSON.stringify(report).includes('secret-do-not-display'));
 const unavailable=await checkConnections({env,fetcher:async()=>{throw Error('secret-do-not-display');}});
 assert.equal(unavailable.openai,'unavailable');assert.ok(!JSON.stringify(unavailable).includes('secret-do-not-display'));
});

test('a model listing is not fabricated from a malformed response or an API failure',async()=>{
 for(const response of [json({id:'other-model'}),new Response('not json'),new Response('',{status:429})]){
  const report=await checkConnections({env:{EDUC_ORIGIN:env.EDUC_ORIGIN,EDUC_OPENAI_API_KEY:'fixture'},fetcher:async()=>response});
  assert.notEqual(report.openai,'model_access_verified');
 }
});

test('configured parent is verified without logging account identity and never inferred from a user list',async()=>{
 const id='11111111-2222-3333-4444-555555555555',calls=[];
 const report=await checkConnections({env:{...env,EDUC_PARENT_ID:id},fetcher:async(url,init)=>{calls.push(url);return url.includes('/admin/users/')?json({id,email:'private@example.test',email_confirmed_at:'2026-01-01'}):success(url,init);}});
 assert.equal(report.parent,'confirmed_account');assert.ok(!JSON.stringify(report).includes(id));assert.ok(!JSON.stringify(report).includes('private@example.test'));
 assert.equal(calls.filter(u=>u.includes('/admin/users')).length,1);
 const unconfirmed=await checkConnections({env:{...env,EDUC_PARENT_ID:id},fetcher:async(url,init)=>url.includes('/admin/users/')?json({id}):success(url,init)});
 assert.equal(unconfirmed.parent,'account_unconfirmed');
});

test('automatic check runs only in the exact personal Vercel production project on main',async()=>{
 const full={...env,VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main',VERCEL_PROJECT_ID:'prj_pxl5Jmoxwmgvtp9zDUXxvIGFFxo2'};
 const deny=()=>{throw Error('preview must not use credentials');};
 for(const changed of [{VERCEL_ENV:'preview'},{VERCEL_ENV:undefined},{VERCEL_GIT_COMMIT_REF:'feature'},{VERCEL_PROJECT_ID:'professional-project'}])assert.equal(await checkProductionConnections({...full,...changed},deny),null);
});
