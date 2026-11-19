import test from 'node:test';import assert from 'node:assert/strict';
import {scheduleParty,startPartySound,partyMuted,setPartyMuted,MASTER_VOLUME} from '../../src/party-sound.js';
// Faux contexte audio : compte les sons programmés et vérifie qu'aucun nœud n'est utilisé sans être démarré ni arrêté.
function fakeCtx(){const log={osc:0,noise:0,started:0,stopped:0,connected:0};
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
 const node=(extra={})=>({connect(){log.connected++;return this;},...extra});
 return {log,currentTime:0,sampleRate:8000,state:'running',resume(){},close(){},destination:node(),
  createBuffer:(c,l)=>({getChannelData:()=>new Float32Array(l)}),
  createGain:()=>node({gain:param()}),createBiquadFilter:()=>node({frequency:param(),type:''}),createStereoPanner:()=>node({pan:param()}),createDynamicsCompressor:()=>node(),
  createOscillator:()=>{log.osc++;return node({type:'',frequency:param(),start(){log.started++;},stop(){log.stopped++;}});},
  createBufferSource:()=>{log.noise++;return node({buffer:null,loop:false,start(){log.started++;},stop(){log.stopped++;}});}};}
test('le son de la fête programme tout (cadeau, éclat, fanfare, feux, avion) et chaque son démarre et s\'arrête',()=>{
 for(const tier of [1,2,3]){const c=fakeCtx(),d=c.createGain();const dur=scheduleParty(c,d,{tier,delays:[0,.8,1.6]});
  assert.ok(dur>=15&&dur<=25);assert.ok(c.log.osc>20,'fanfare + éclats : '+c.log.osc);assert.ok(c.log.noise>40,'tics, pop et crépitements : '+c.log.noise);assert.equal(c.log.started,c.log.stopped);}
 const a=fakeCtx();scheduleParty(a,a.createGain(),{tier:1,delays:[0]});const b=fakeCtx();scheduleParty(b,b.createGain(),{tier:3,delays:[0,.8,1.6,2.2,.4,1.2,2.8,1.9]});
 assert.ok(b.log.osc+b.log.noise>a.log.osc+a.log.noise,'plus riche aux grands niveaux');
});
test('le son peut être coupé et se souvient du choix; sans audio, rien ne plante',()=>{
 const mem=new Map();globalThis.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))};
 assert.equal(partyMuted(),false);setPartyMuted(true);assert.equal(partyMuted(),true);setPartyMuted(false);assert.equal(partyMuted(),false);
 const s=startPartySound({tier:1});assert.doesNotThrow(()=>{s.stop();s.resume();});assert.ok(MASTER_VOLUME>0&&MASTER_VOLUME<=.6);
 delete globalThis.localStorage;
});
