import test from 'node:test';import assert from 'node:assert/strict';
const {OnlineNarrator}=await import('../../src/online-narrator.js');
const mp3=new Uint8Array(2000).buffer;
const mk=(over={})=>{const log=[];const device={speak:(t,o)=>log.push(['device',t]),stop:()=>{},pause:()=>false,resume:()=>false,setSpeed:()=>{}};
 class FakeAudio{constructor(src){this.src=src;this.duration=2;this.currentTime=0;FakeAudio.last=this;}play(){return Promise.resolve();}pause(){}}
 const URLClass={createObjectURL:()=>'blob:x',revokeObjectURL(){}};const warmed=[];const states=[];
 const n=new OnlineNarrator({device,AudioClass:FakeAudio,URLClass,peek:()=>null,warm:t=>warmed.push(t),...over});
 return {n,log,warmed,states,FakeAudio};};
const tick=()=>new Promise(r=>setTimeout(r,5));
test('page déjà prête : la narratrice douce joue au moment même du toucher, sans voix de l’appareil',async()=>{
 const {n,log,states,FakeAudio}=mk({peek:()=>mp3});n.speak('Bonjour Liana !',{onState:s=>states.push(s)});assert.ok(FakeAudio.last,'audio créé dans le geste');await tick();
 assert.deepEqual(states,['starting','speaking']);assert.equal(log.length,0);FakeAudio.last.onended();assert.equal(states.at(-1),'ended');
});
test('page inconnue : la voix de l’appareil parle IMMÉDIATEMENT (sans attente) et la narratrice se prépare pour la fois suivante',()=>{
 const {n,log,warmed}=mk();n.speak('bai',{});assert.equal(log.length,1,'synchrone');assert.deepEqual(warmed,['bai']);
});
test('deviceOnly, voix de l’appareil choisie ou texte hors limites : jamais de voix en ligne ni de préparation',()=>{
 const a=mk({peek:()=>mp3});a.n.speak('Un mot',{deviceOnly:true});
 const b=mk({peek:()=>mp3,canUse:()=>false});b.n.speak('Un mot',{});
 const c=mk({peek:()=>mp3});c.n.speak('x'.repeat(601),{});c.n.speak('a',{});
 for(const x of [a,b,c]){assert.ok(x.log.every(l=>l[0]==='device'));assert.equal(x.warmed.length,0);}
});
test('erreur de lecture audio : repli sur la voix de l’appareil',async()=>{
 const {n,log,FakeAudio}=mk({peek:()=>mp3});n.speak('Un mot',{});await tick();FakeAudio.last.onerror();assert.equal(log.length,1);
});
test('lecture audio refusée par le navigateur : repli sur la voix de l’appareil',async()=>{
 class Blocked{constructor(){}play(){return Promise.reject(new Error('NotAllowed'));}pause(){}}
 const {n,log}=mk({peek:()=>mp3,AudioClass:Blocked});n.speak('Un mot',{});await tick();assert.equal(log.length,1);
});
test('arrêter coupe la lecture en cours',async()=>{
 const {n,states}=mk({peek:()=>mp3});n.speak('Un mot',{onState:s=>states.push(s)});n.stop();await tick();assert.ok(!states.includes('speaking'));
});
