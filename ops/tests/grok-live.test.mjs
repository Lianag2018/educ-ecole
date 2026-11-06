import test from 'node:test';
import assert from 'node:assert/strict';
import {GrokLive,grokMarkup} from '../../src/grok-live.js';
import {createGrokEndpoints,grokReadiness} from '../server/grok-live.mjs';
import {runtime} from '../server/runtime.mjs';
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const ok=()=>({ok:true,json:async()=>({durationSeconds:120})});
const context={profileId:'p1',mode:'reading'};
test('unavailable never requests a session or microphone',async()=>{
 let calls=0;const c=new GrokLive({request:()=>calls++,microphone:()=>calls++});await c.start(context);assert.equal(calls,0);
});
test('stop during session issuance closes microphone and prevents late transport',async()=>{
 const d=deferred();let stopped=0,connected=0;const c=new GrokLive({request:()=>d.promise,microphone:async()=>({getTracks:()=>[{stop:()=>stopped++}]}),connect:()=>connected++});c.available=true;
 const start=c.start(context);await new Promise(r=>setImmediate(r));c.stop();d.resolve(ok());await start;assert.equal(stopped,1);assert.equal(connected,0);
});
test('late permission grant is stopped after navigation or profile change',async()=>{
 const d=deferred();let stopped=0;const c=new GrokLive({request:async()=>ok(),microphone:()=>d.promise,connect:()=>{throw Error('late connect');}});c.available=true;
 const start=c.start(context);await new Promise(r=>setImmediate(r));c.stop();d.resolve({getTracks:()=>[{stop:()=>stopped++}]});await start;assert.equal(stopped,1);
});
test('stop tears down tracks, playback/transport and ignores late callbacks',async()=>{
 let stopped=0,closed=0,callbacks;const messages=[];
 const c=new GrokLive({request:async()=>ok(),microphone:async()=>({getTracks:()=>[{stop:()=>stopped++}]}),connect:async(_s,_m,cb)=>{callbacks=cb;return {close(){closed++;}};},onState:s=>messages.push(s)});c.available=true;
 await c.start(context);c.stop();const n=messages.length;callbacks.onMessage('late');callbacks.onClose();assert.equal(messages.length,n);assert.equal(stopped,1);assert.equal(closed,1);
});
test('a connection resolving after stop is immediately closed',async()=>{
 const d=deferred();let closed=0;
 const c=new GrokLive({request:async()=>ok(),microphone:async()=>({getTracks:()=>[]}),connect:()=>d.promise});c.available=true;
 const pending=c.start(context);await new Promise(r=>setImmediate(r));c.stop();d.resolve({close:()=>closed++});await pending;assert.equal(closed,1);
});
test('invalid duration closes microphone without sending audio',async()=>{
 for(const durationSeconds of [0,181,'120',null]){let stopped=0,connected=0;const c=new GrokLive({request:async()=>({ok:true,json:async()=>({durationSeconds})}),microphone:async()=>({getTracks:()=>[{stop:()=>stopped++}]}),connect:()=>connected++});c.available=true;await c.start(context);assert.equal(stopped,1);assert.equal(connected,0);}
});
test('new session cancels the prior mode and sends only selected context',async()=>{
 let closed=0;const bodies=[];const c=new GrokLive({request:async(_u,init)=>{bodies.push(JSON.parse(init.body));return ok();},microphone:async()=>({getTracks:()=>[]}),connect:async()=>({close:()=>closed++})});c.available=true;
 await c.start(context);await c.start({profileId:'p2',mode:'number'});assert.equal(closed,1);assert.deepEqual(bodies,[context,{profileId:'p2',mode:'number'}]);c.stop();
});
test('all three entry buttons start disabled',()=>{for(const mode of ['reading','owl','number'])assert.match(grokMarkup(mode),/data-grok-start disabled/);});
test('key and review flags alone never bypass the budget and relay configuration',()=>{
 const config={voiceAccessVerified:true,childDataEligibilityReviewed:true,endpointRetentionReviewed:true,adultTrialPassed:true};const state=grokReadiness({apiKey:'test-only',config});assert.equal(state.available,false);assert.ok(state.missing.includes('budget_pricing'));assert.ok(state.missing.includes('relay_key'));assert.ok(!state.missing.includes('adult_trial'));
});
test('status conceals configuration from guests; sessions fail closed',async()=>{
 const parent={id:'test-parent',role:'parent',emailVerified:true,recentLogin:true,csrfVerified:true};
 for(const who of [null,parent]){const route=createGrokEndpoints({auth:{authenticateParent:async()=>who},apiKey:'test-only'});const status=await route({method:'POST',path:'/api/voice/grok/status'});assert.equal(status.body.available,false);assert.equal(status.body.authenticated,Boolean(who));assert.equal('missing' in status.body,Boolean(who));assert.equal((await route({method:'POST',path:'/api/voice/grok/session'})).status,who?503:401);assert.equal((await route({method:'GET',path:'/api/voice/grok/status'})).status,405);}
});
test('production router never calls xAI on status or unauthorized session',async()=>{
 let calls=0;const route=runtime({EDUC_XAI_API_KEY:'test-only'},()=>{calls++;throw Error('network forbidden');});
 for(const path of ['/api/voice/grok/status','/api/voice/grok/session'])await route({path,method:'POST',headers:{},body:context});assert.equal(calls,0);
});
test('microphone permission is requested during the tap before any network await',async()=>{
 const permission=deferred(),order=[];let stopped=0;
 const c=new GrokLive({prepareAudio:()=>{order.push('audio');return {resumed:Promise.resolve(),close(){}};},microphone:()=>{order.push('permission');return permission.promise;},request:async()=>{order.push('session');return ok();},connect:async()=>{order.push('transport');return {close(){}};}});c.available=true;
 const pending=c.start(context);assert.deepEqual(order,['audio','permission']);
 permission.resolve({getTracks:()=>[{stop:()=>stopped++}]});await pending;
 assert.deepEqual(order,['audio','permission','session','transport']);c.stop();assert.equal(stopped,1);
});
test('refused, absent or busy microphone gets a specific message and no paid session',async()=>{
 for(const [name,message] of [['NotAllowedError',/accès au microphone a été refusé/],['NotFoundError',/Aucun microphone/],['NotReadableError',/autres appels/]]){
  let requests=0,closed=0;const states=[];
  const c=new GrokLive({prepareAudio:()=>({resumed:Promise.resolve(),close:()=>closed++}),microphone:async()=>{throw Object.assign(Error('PRIVATE'),{name});},request:()=>requests++,onState:s=>states.push(s)});c.available=true;await c.start(context);
  assert.equal(requests,0);assert.equal(closed,1);assert.match(states.at(-1),message);assert.ok(!states.join().includes('PRIVATE'));
 }
});
test('audio initialization failure is not reported as Grok failure',async()=>{
 let calls=0;const states=[];const c=new GrokLive({prepareAudio:()=>{throw Error('PRIVATE');},microphone:()=>calls++,request:()=>calls++,onState:s=>states.push(s)});c.available=true;await c.start(context);assert.equal(calls,0);assert.match(states.at(-1),/démarrer le son/);
});
test('expired parent session closes microphone and restores login action',async()=>{
 let stopped=0,login=0,connected=0;const states=[];
 const c=new GrokLive({microphone:async()=>({getTracks:()=>[{stop:()=>stopped++}]}),request:async()=>({ok:false,json:async()=>({code:'parent_login_required',message:'PRIVATE'})}),connect:()=>connected++,onAuthRequired:()=>login++,onState:s=>states.push(s)});c.available=true;await c.start(context);
 assert.equal(stopped,1);assert.equal(login,1);assert.equal(connected,0);assert.equal(c.available,false);assert.match(states.at(-1),/connexion parent a expiré/);assert.ok(!states.join().includes('PRIVATE'));
});
test('server failure differs from microphone refusal and releases capture',async()=>{
 let stopped=0;const states=[];const c=new GrokLive({microphone:async()=>({getTracks:()=>[{stop:()=>stopped++}]}),request:async()=>({ok:false,json:async()=>({code:'grok_provider_unavailable'})}),onState:s=>states.push(s)});c.available=true;await c.start(context);assert.equal(stopped,1);assert.match(states.at(-1),/serveur n’a pas pu ouvrir/);
});
test('startup timeout stops a permission granted late without issuing a session',async()=>{
 const permission=deferred();let requests=0,stopped=0;const states=[];
 const c=new GrokLive({startTimeoutMs:5,microphone:()=>permission.promise,request:()=>requests++,onState:s=>states.push(s)});c.available=true;const pending=c.start(context);await new Promise(r=>setTimeout(r,20));
 permission.resolve({getTracks:()=>[{stop:()=>stopped++}]});await pending;assert.equal(requests,0);assert.equal(stopped,1);assert.match(states.at(-1),/pris trop de temps/);
});

