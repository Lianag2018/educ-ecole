import test from 'node:test';
import assert from 'node:assert/strict';
import {NarrationSpeaker} from '../../src/narration.js';
import {narrationCatalog} from '../narration-catalog.mjs';
import {numberWords,numberParts} from '../../src/numbers.js';
const file='a'.repeat(64)+'.mp3';
class FakeAudio {pause(){}setAttribute(){}removeAttribute(){}play(){this.played=(this.played||0)+1;return Promise.resolve();}}
test('catalog includes every requested number, first word and fictional stories, without child records',()=>{
 const c=narrationCatalog(),texts=new Set(c.map(x=>x.text));
 for(let n=0;n<=1999;n++)assert.ok(texts.has(numberWords(n))||numberParts(n).every(s=>texts.has(s)));
 assert.ok(texts.has('lapin'));assert.ok(c.some(x=>x.text.startsWith('Deux sœurs rêvent.')));
 assert.ok(c.every(x=>!x.text.includes('Liana')&&!x.text.includes('Mely-Ann')));
 assert.ok(c.length<=1250);assert.ok(c.reduce((n,x)=>n+x.text.length,0)<=150000);
});
test('all numbers can play in short spoken groups when a complete recording is absent',async()=>{
 const clips=Object.fromEntries(narrationCatalog().map(c=>[c.text,file]));delete clips[numberWords(1999)];
 const p=new NarrationSpeaker({fallback:{stop(){},speak(){throw Error('fallback unexpected');}},AudioClass:FakeAudio,fetcher:async()=>({ok:true,json:async()=>({version:1,clips})})});
 await p.ready;p.speak('1999');assert.equal(p.audio.played,1);p.audio.onended();p.audio.onended();assert.equal(p.audio.played,3);
 assert.deepEqual(numberParts(1001),['mille','un']);assert.deepEqual(numberParts(307),['trois cents','sept']);
});
test('recorded speech starts in the tap handler and stale callbacks cannot resume it',async()=>{
 let fallback=0;const states=[];const player=new NarrationSpeaker({fallback:{stop(){},speak(){fallback++;}},AudioClass:FakeAudio,fetcher:async()=>({ok:true,json:async()=>({version:1,clips:{'trois cent sept':file,'lapin':file}})})});
 await player.ready;player.speak('307',{onState:s=>states.push(s)});assert.equal(player.audio.played,1);assert.equal(fallback,0);assert.equal(player.audio.src,'/audio/'+file);
 player.audio.onplaying();assert.equal(states.at(-1),'speaking');const ended=player.audio.onended;player.stop();ended();assert.equal(states.at(-1),'speaking');
 player.speak('texte scolaire privé');assert.equal(fallback,1);
});
test('line reading queues known audio only and respects stop',async()=>{
 const p=new NarrationSpeaker({fallback:{stop(){},speak(){throw Error('fallback unexpected');}},AudioClass:FakeAudio,fetcher:async()=>({ok:true,json:async()=>({version:1,clips:{mille:file,'mille un':file}})})});
 await p.ready;p.speak('mille. mille un');assert.equal(p.audio.played,1);p.audio.onended();assert.equal(p.audio.played,2);p.stop();
});
