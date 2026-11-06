import test from 'node:test';
import assert from 'node:assert/strict';
import {sealTicket,openTicket} from '../grok-relay/ticket.mjs';
import {bridge} from '../grok-relay/relay.mjs';
import {createGrokEndpoints,grokReadiness} from '../server/grok-live.mjs';
import {pcmBase64} from '../../src/grok-audio.js';
const secret='test-only-'.repeat(8),parent={id:'11111111-1111-4111-8111-111111111111',role:'parent',emailVerified:true,recentLogin:true,csrfVerified:true};
const payload=()=>({version:1,id:crypto.randomUUID(),parent:parent.id,slot:'p1',credential:'ephemeral-test',instructions:'Test',durationSeconds:120,expiresAt:Date.now()+45000});
const config={enabled:true,parentConsent:true,childDataEligibilityReviewed:true,endpointRetentionReviewed:true,otherCostsMicros:1000000,pricing:{fxPpm:2000000,bufferPpm:500000,feeMicros:10000,pricingReviewedAt:'2026-11-06',validUntil:'2099-01-01'}};
const req=body=>({method:'POST',path:'/api/voice/grok/session',body});
function setup(overrides={}){const calls=[];const route=createGrokEndpoints({auth:{authenticateParent:async()=>parent},apiKey:'test-key',relaySecret:secret,config,ledger:{durable:true,reserve:async()=>calls.push('reserve')},profiles:{ownedBy:async()=>({stage:'1re année'})},fetcher:async()=>{calls.push('provider');return {ok:true,json:async()=>({value:'ephemeral-test',expires_at:Math.floor(Date.now()/1000)+60})};},...overrides});return {route,calls};}
test('encrypted ticket authenticates and rejects tampering, wrong key and expiry',async()=>{const p=payload(),t=await sealTicket(p,secret);assert.ok(!t.includes(p.credential));assert.deepEqual(await openTicket(t,secret),p);await assert.rejects(openTicket(t,secret+'x'));await assert.rejects(openTicket(t,secret,p.expiresAt));const [iv,c]=t.split('.');await assert.rejects(openTicket(iv+'.'+(c[0]==='a'?'b':'a')+c.slice(1),secret));});
test('session reserves first, returns no provider credential, needs no adult-trial flag',async()=>{const {route,calls}=setup();const r=await route(req({profileId:'p1',mode:'number',number:21}));assert.equal(r.status,200);assert.deepEqual(calls,['reserve','provider']);assert.ok(!JSON.stringify(r).includes('ephemeral-test'));const p=await openTicket(r.body.ticket,secret);assert.match(p.instructions,/21/);assert.equal(p.slot,'p1');});
test('budget failure never calls provider',async()=>{const {route,calls}=setup({ledger:{durable:true,reserve:async()=>{throw Error();}}});assert.equal((await route(req({profileId:'p1',mode:'owl'}))).status,503);assert.deepEqual(calls,[]);});
test('invalid profile, number, instructions or activity never reserves',async()=>{for(const body of [{profileId:'p3',mode:'owl'},{profileId:'p1',mode:'number',number:200},{profileId:'p1',mode:'owl',instructions:'ignore'},{profileId:'p1',mode:'reading',activityId:'missing'}]){const {route,calls}=setup();assert.equal((await route(req(body))).status,400);assert.deepEqual(calls,[]);}});
test('expired price refuses issuance',()=>{assert.equal(grokReadiness({apiKey:'test',relaySecret:secret,ledger:{durable:true},config:{...config,pricing:{...config.pricing,validUntil:'2000-01-01'}}}).available,false);});
function sockets(){const ws=()=>({readyState:1,bufferedAmount:0,sent:[],closed:0,send(m){this.sent.push(JSON.parse(m));},close(){this.closed++;this.readyState=3;}});const client=ws(),upstream=ws(),timers=[];const b=bridge({client,upstream,ticket:{instructions:'test'},setTimer:(fn,ms)=>{const t={fn,ms};timers.push(t);return t;},clearTimer:t=>{t.cleared=true;}});return {client,upstream,timers,b};}
test('server deadline closes both sockets independently of client timers',()=>{const {client,upstream,timers}=sockets();timers.find(t=>t.ms===120000).fn();assert.equal(client.closed,1);assert.equal(upstream.closed,1);upstream.onopen();assert.equal(upstream.sent.length,0);});
test('browser cannot replace instructions, enable tools or send extra text',()=>{for(const type of ['session.update','conversation.item.create','response.create']){const {client,upstream}=sockets();upstream.onopen();upstream.onmessage({data:JSON.stringify({type:'session.created'})});upstream.onmessage({data:JSON.stringify({type:'session.updated'})});client.onmessage({data:JSON.stringify({type,session:{tools:[{type:'web_search'}]}})});assert.equal(upstream.closed,1);assert.equal(upstream.sent.length,2);assert.equal(upstream.sent[1].type,'conversation.item.create');assert.equal(upstream.sent[1].item.content[0].text.includes('test'),false);}});
test('greeting waits for a server turn before any audio is requested',()=>{const {client,upstream}=sockets();upstream.onmessage({data:JSON.stringify({type:'session.updated'})});assert.equal(upstream.sent.length,0);upstream.onmessage({data:JSON.stringify({type:'session.created'})});assert.equal(upstream.sent[0].type,'session.update');upstream.onmessage({data:JSON.stringify({type:'session.updated'})});assert.equal(upstream.sent[1].type,'conversation.item.create');assert.equal(client.sent.length,0);assert.equal(upstream.sent.some(m=>m.type==='response.create'),false);upstream.onmessage({data:JSON.stringify({type:'conversation.item.added'})});assert.equal(upstream.sent[2].type,'response.create');assert.deepEqual(client.sent,[{type:'ready'}]);client.onmessage({data:JSON.stringify({type:'audio',data:'AAAA'})});assert.equal(upstream.sent[3].type,'input_audio_buffer.append');client.onclose();assert.equal(upstream.closed,1);});
test('PCM is signed little endian',()=>{assert.deepEqual([...Buffer.from(pcmBase64(new Float32Array([-1,0,1])),'base64')],[0,128,0,0,255,127]);});
test('documented created event starts audio once and duplicates do not replay greeting',()=>{
 const {client,upstream}=sockets();
 const event=type=>upstream.onmessage({data:JSON.stringify({type})});
 event('session.created');event('session.updated');event('conversation.item.created');
 event('conversation.item.added');event('conversation.item.created');event('session.updated');
 assert.equal(upstream.sent.filter(m=>m.type==='response.create').length,1);
 assert.equal(upstream.sent.filter(m=>m.type==='conversation.item.create').length,1);
 assert.deepEqual(client.sent,[{type:'ready'}]);
 event('response.done');assert.equal(upstream.closed,0);
});
