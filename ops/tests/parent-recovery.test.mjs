import test from 'node:test';
import assert from 'node:assert/strict';
import {recoverParent} from '../server/parent-recovery.mjs';
import {createSupabaseClient} from '../server/supabase-client.mjs';
const env={EDUC_ORIGIN:'https://school.example',EDUC_PARENT_ID:'parent-only'},now=1800000000000;
const token='header.'+Buffer.from(JSON.stringify({iat:now/1000})).toString('base64url')+'.signature';
const user={id:'parent-only',email:'parent@example.test',email_confirmed_at:'yes'};
const req=(path,body)=>({method:'POST',path:'/api/parent/'+path,headers:{origin:env.EDUC_ORIGIN},body});
function setup(overrides={}){const calls=[];return {calls,deps:{env,now:()=>now,sb:async(...args)=>{calls.push(args);if(args[0].startsWith('/auth/v1/admin/users/'))return user;if(args[0]==='/auth/v1/user'&&!args[1])return {...user,...overrides};return {};}}};}
test('recovery enforces origin and parent email without exposing membership',async()=>{
 const {deps,calls}=setup();assert.equal((await recoverParent({...req('recover',{email:user.email}),headers:{}},deps)).status,403);assert.equal(calls.length,0);
 assert.equal((await recoverParent(req('recover',{email:'other@example.test'}),deps)).status,200);assert.equal(calls.length,1);
 const r=await recoverParent(req('recover',{email:' PARENT@example.test '}),deps);assert.equal(r.status,200);assert.match(calls.at(-1)[0],/recover\?redirect_to=https%3A%2F%2Fschool.example%2Frecovery.html/);assert.deepEqual(calls.at(-1)[1],{email:user.email});assert.deepEqual(r.body,{ok:true});
});
test('recovery fails honestly on provider failure, without provider error contents',async()=>{
 const r=await recoverParent(req('recover',{email:user.email}),{env,sb:async()=>{throw Error('private details');}});assert.equal(r.status,503);assert.equal(JSON.stringify(r).includes('private'),false);
});
test('only verified current parent token can update own password',async()=>{
 const {deps,calls}=setup();const r=await recoverParent(req('reset-password',{accessToken:token,password:'new-password-example'}),deps);assert.equal(r.status,200);assert.match(r.headers['Set-Cookie'],/HttpOnly/);assert.equal(calls[0][0],'/auth/v1/user');assert.equal(calls[0][2],token);assert.deepEqual(calls[1],['/auth/v1/user',{password:'new-password-example'},token,{method:'PUT'}]);
 for(const override of [{id:'other'},{email_confirmed_at:null},{is_anonymous:true}]){const x=setup(override);assert.equal((await recoverParent(req('reset-password',{accessToken:token,password:'new-password-example'}),x.deps)).status,403);assert.equal(x.calls.length,1);}
});
test('expired tokens, short passwords, provider rejection and unverified tokens cannot create session',async()=>{
 let x=setup();x.deps.now=()=>now+601000;assert.equal((await recoverParent(req('reset-password',{accessToken:token,password:'new-password-example'}),x.deps)).status,401);assert.equal(x.calls.length,1);
 x=setup();assert.equal((await recoverParent(req('reset-password',{accessToken:token,password:'short'}),x.deps)).status,400);assert.equal(x.calls.length,0);
 const r=await recoverParent(req('reset-password',{accessToken:token,password:'new-password-example'}),{env,now:()=>now,sb:async(path,body)=>{if(body)throw Error('rejected');return user;}});assert.equal(r.status,422);assert.equal(r.headers,undefined);
 const denied=await recoverParent(req('reset-password',{accessToken:token,password:'new-password-example'}),{env,sb:async()=>{throw Error('invalid');}});assert.equal(denied.status,401);
});
test('recovery email uses public key so provider rate limits remain active',async()=>{
 let headers;const sb=createSupabaseClient({url:'https://example.supabase.co',anon:'sb_publishable_test',key:'sb_secret_test',fetcher:async(u,o)=>{headers=o.headers;return {ok:true,json:async()=>({})};}});await sb('/auth/v1/recover?redirect_to=https%3A%2F%2Fschool.example%2Frecovery.html',{email:user.email});assert.equal(headers.apikey,'sb_publishable_test');assert.equal(headers.Authorization,undefined);
});
