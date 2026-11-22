import test from 'node:test';import assert from 'node:assert/strict';
const {OnlineNarrator}=await import('../../src/online-narrator.js');
const mk=(over={})=>{const log=[];const device={speak:(t,o)=>log.push(['device',t,!!o.deviceOnly]),stop:()=>log.push(['dstop']),pause:()=>false,resume:()=>false,setSpeed:()=>{}};
 const timers=[];const setTimer=(fn,ms)=>{timers.push({fn,ms});return timers.length;};const clearTimer=id=>{if(timers[id-1])timers[id-1].dead=true;};
 class FakeAudio{constructor(src){this.src=src;this.duration=2;this.currentTime=0;FakeAudio.last=this;}play(){return Promise.resolve();}pause(){}}
 const URLClass={createObjectURL:()=>'blob:x',revokeObjectURL(){}};
 const states=[];const n=new OnlineNarrator({device,AudioClass:FakeAudio,URLClass,setTimer,clearTimer,getAudio:async()=>({bytes:new Uint8Array(2000).buffer}),...over});
 return {n,log,timers,states,FakeAudio};};
const tick=()=>new Promise(r=>setTimeout(r,5));
test('la voix en ligne joue quand elle est prête, sans voix de l’appareil',async()=>{
 const {n,log,states,FakeAudio}=mk();n.speak('Bonjour Liana !',{onState:(s,m)=>states.push(s)});await tick();
 assert.deepEqual(states,['starting','speaking']);assert.equal(log.filter(x=>x[0]==='device').length,0);
 FakeAudio.last.onended();assert.equal(states.at(-1),'ended');
});
test('si le serveur ne répond pas : voix de l’appareil immédiatement',async()=>{
 const {n,log}=mk({getAudio:async()=>null});n.speak('Un mot',{});await tick();
 assert.equal(log.filter(x=>x[0]==='device').length,1);
});
test('si la voix en ligne tarde : l’appareil prend le relais et la voix en ligne tardive est ignorée',async()=>{
 let resolve;const {n,log,timers,states}=mk({getAudio:()=>new Promise(r=>{resolve=r;})});n.speak('Un mot lent',{onState:(s)=>states.push(s)});await tick();
 timers[0].fn();assert.equal(log.filter(x=>x[0]==='device').length,1);
 resolve({bytes:new Uint8Array(2000).buffer});await tick();assert.equal(states.includes('speaking'),false);
});
test('deviceOnly, voix de l’appareil choisie ou texte hors limites : jamais de voix en ligne',async()=>{
 let calls=0;const g=async()=>{calls++;return null;};
 const a=mk({getAudio:g});a.n.speak('Un mot',{deviceOnly:true});
 const b=mk({getAudio:g,canUse:()=>false});b.n.speak('Un mot',{});
 const c=mk({getAudio:g});c.n.speak('x'.repeat(601),{});c.n.speak('a',{});
 await tick();assert.equal(calls,0);assert.equal(a.log.at(-1)[0],'device');assert.equal(b.log.at(-1)[0],'device');
});
test('arrêter annule la lecture en attente',async()=>{
 const {n,log,states}=mk();n.speak('Un mot',{onState:(s)=>states.push(s)});n.stop();await tick();
 assert.equal(states.length,0);assert.equal(log.filter(x=>x[0]==='device'&&x[1]).length,0);
});
test('erreur de lecture audio : repli sur la voix de l’appareil',async()=>{
 const {n,log,FakeAudio}=mk();n.speak('Un mot',{});await tick();FakeAudio.last.onerror();
 assert.equal(log.filter(x=>x[0]==='device'&&x[1]).length,1);
});
