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
test('stop during session issuance prevents late microphone acquisition',async()=>{
 const d=deferred();let calls=0;const c=new GrokLive({request:()=>d.promise,microphone:()=>calls++});c.available=true;
 const start=c.start(context);c.stop();d.resolve(ok());await start;assert.equal(calls,0);
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
test('invalid duration and failed sessions cannot open microphone',async()=>{
 for(const durationSeconds of [0,181,'120',null]){let calls=0;const c=new GrokLive({request:async()=>({ok:true,json:async()=>({durationSeconds})}),microphone:()=>calls++});c.available=true;await c.start(context);assert.equal(calls,0);}
});
test('new session cancels the prior mode and sends only selected context',async()=>{
 let closed=0;const bodies=[];const c=new GrokLive({request:async(_u,init)=>{bodies.push(JSON.parse(init.body));return ok();},microphone:async()=>({getTracks:()=>[]}),connect:async()=>({close:()=>closed++})});c.available=true;
 await c.start(context);await c.start({profileId:'p2',mode:'number'});assert.equal(closed,1);assert.deepEqual(bodies,[context,{profileId:'p2',mode:'number'}]);c.stop();
});
test('all three entry buttons start disabled',()=>{for(const mode of ['reading','owl','number'])assert.match(grokMarkup(mode),/data-grok-start disabled/);});
test('key and review flags alone never bypass the missing server relay',()=>{
 const config={voiceAccessVerified:true,childDataEligibilityReviewed:true,endpointRetentionReviewed:true,adultTrialPassed:true};assert.deepEqual(grokReadiness({apiKey:'test-only',config}),{available:false,missing:['bounded_transport']});
});
test('status conceals configuration from guests; sessions fail closed',async()=>{
 const parent={id:'test-parent',role:'parent',emailVerified:true,recentLogin:true,csrfVerified:true};
 for(const who of [null,parent]){const route=createGrokEndpoints({auth:{authenticateParent:async()=>who},apiKey:'test-only'});const status=await route({method:'POST',path:'/api/voice/grok/status'});assert.equal(status.body.available,false);assert.equal(status.body.authenticated,Boolean(who));assert.equal('missing' in status.body,Boolean(who));assert.equal((await route({method:'POST',path:'/api/voice/grok/session'})).status,who?503:401);assert.equal((await route({method:'GET',path:'/api/voice/grok/status'})).status,405);}
});
test('production router never calls xAI on status or unauthorized session',async()=>{
 let calls=0;const route=runtime({EDUC_XAI_API_KEY:'test-only'},()=>{calls++;throw Error('network forbidden');});
 for(const path of ['/api/voice/grok/status','/api/voice/grok/session'])await route({path,method:'POST',headers:{},body:context});assert.equal(calls,0);
});
