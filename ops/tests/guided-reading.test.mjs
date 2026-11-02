import test from 'node:test';
import assert from 'node:assert/strict';
import {readingCues,cueAt,guidedMarkup} from '../../src/guided-reading.js';
import {NarrationSpeaker} from '../../src/narration.js';
test('pauses, expression and curated liaisons are distinguished without invented general rules',()=>{
 const p=readingCues('Les amis, viens ! Un arbre. Un haricot ?');
 assert.equal(p.tokens[0].link,'z');assert.equal(p.tokens.find(t=>t.text===",").kind,'comma');
 assert.ok(p.tokens.some(t=>t.kind==='expression'));assert.ok(p.tokens.some(t=>t.kind==='question'));
 assert.equal(p.tokens.find(t=>t.text==='haricot').link,undefined);
 assert.equal(cueAt(p,0),0);assert.equal(cueAt(p,1),p.tokens.length-1);
 assert.equal(cueAt(readingCues(''),0),-1);
});
test('rendering escapes text and attributes, and explains stable reading help',()=>{
 const html=guidedMarkup('<img src=x> "bonjour"');assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;'));assert.ok(html.includes('Syllabes en couleur'));
});
test('recorded cues follow actual media time and ignore callbacks after stop',async()=>{
 class Audio{pause(){}setAttribute(){}removeAttribute(){}play(){return Promise.resolve();}}
 const p=new NarrationSpeaker({fallback:{stop(){}},AudioClass:Audio,fetcher:async()=>({ok:true,json:async()=>({version:1,clips:{'Les amis.':'a'.repeat(64)+'.mp3'}})})});
 await p.ready;const cues=[];p.speak('Les amis.',{onProgress:e=>cues.push(e)});
 p.audio.duration=10;p.audio.currentTime=4;p.audio.ontimeupdate();assert.equal(cues[0].progress,.4);
 p.audio.currentTime=2;p.audio.ontimeupdate();assert.equal(cues[1].progress,.2);
 const callback=p.audio.ontimeupdate;p.stop();callback();assert.equal(cues.length,2);assert.equal(p.audio.ontimeupdate,null);
});

import {syllableParts} from '../../src/reading-syllables.js';
import {syllableIndex} from '../../src/guided-reading.js';
test('ball travels across syllables, then pauses on punctuation for either grade',()=>{
 const plan=readingCues('Lapin, animation!');
 assert.deepEqual(plan.tokens[0].parts,['La','pin']);
 assert.deepEqual(plan.tokens[2].parts,['a','ni','ma','tion']);
 assert.equal(syllableIndex(plan,0,{wordProgress:.1}),0);
 assert.equal(syllableIndex(plan,0,{wordProgress:.7}),1);
 assert.equal(syllableIndex(plan,1,{wordProgress:1}),0);
 assert.equal(plan.tokens[1].kind,'comma');assert.equal(plan.tokens[3].kind,'expression');
 assert.equal(syllableIndex(plan,2,{wordProgress:.8}),3);
 for(const older of [false,true])assert.match(guidedMarkup('Lapin!',older),/data-part="1">pin/);
 assert.deepEqual(syllableParts('inconnuinventé'),['inconnuinventé']);
 assert.equal(syllableParts('bibliothèque').join(''),'bibliothèque');
});

import {mediaReadingEvent} from '../../src/narration.js';
import {readingPages,activityPages} from '../../src/beginner-access.js';
test('measured syllables follow media time including seeks, silence and punctuation',()=>{
 const text='Cauchemar, puis le chat.',cues=[{start:1,end:2.5,charIndex:0,charEnd:9,syllables:[{start:1,end:1.2},{start:1.2,end:1.9},{start:1.9,end:2.5}]}];
 const plan=readingCues(text);
 assert.deepEqual(plan.tokens[0].parts,['Cau','che','mar']);
 for(const [time,part] of [[1.05,0],[1.8,1],[2.1,2],[1.1,0]]){
  const e=mediaReadingEvent(text,cues,time);assert.equal(e.timing,'syllable');assert.equal(syllableIndex(plan,0,e),part);
 }
 assert.equal(mediaReadingEvent(text,cues,.5).charIndex,-1);
 assert.equal(mediaReadingEvent(text,cues,2.6).charIndex,9);
 assert.equal(syllableIndex(plan,0,{timing:'word',wordProgress:.8}),-1);
 assert.equal(syllableIndex(plan,0,{timing:'unavailable',progress:.4}),-1);
 const invalid=[{...cues[0],syllables:[{start:1,end:4}]}];
 assert.equal(mediaReadingEvent(text,invalid,1.1).timing,'word');
});
test('silent consonants and four colors preserve the spelling for both readers',()=>{
 for(const older of [false,true]){
  const html=guidedMarkup('Cauchemar chat animation',older);
  assert.match(html,/syllable-2/);assert.match(html,/syllable-3/);
  assert.match(html,/silent-letter">t<\/span>/);assert.doesNotMatch(html,/silent-letter">r<\/span>/);
 }
});
test('tablet story pages preserve all text and work for both grades',()=>{
 const text='Une petite licorne regarde les animaux. Elle retrouve son ami près du jardin. Puis ils rentrent ensemble.';
 for(const id of ['p1','p2']){
  const pages=activityPages({text,skill:'comprehension'},{id});
  assert.equal(pages.join(' '),text);
 }
 const long=Array.from({length:100},(_,i)=>'mot'+i).join(' ')+'.';
 const pages=readingPages(long,22);assert.equal(pages.join(' '),long);assert.ok(pages.every(s=>s.split(/\s+/).length<=22));
});
test('pause and resume keep the prerecorded position and speed',async()=>{
 class Audio{pause(){this.paused=true;}setAttribute(){}removeAttribute(){}play(){this.paused=false;return Promise.resolve();}}
 const p=new NarrationSpeaker({fallback:{stop(){}},AudioClass:Audio,fetcher:async()=>({ok:true,json:async()=>({version:1,clips:{'Les amis.':'a'.repeat(64)+'.mp3'}})})});
 await p.ready;const states=[];p.speak('Les amis.',{speed:.8,onState:s=>states.push(s)});p.audio.currentTime=1.3;
 assert.equal(p.pause(),true);assert.equal(states.at(-1),'paused');assert.equal(p.audio.currentTime,1.3);
 assert.equal(p.resume(),true);assert.equal(p.audio.currentTime,1.3);assert.equal(p.audio.playbackRate,.8);
 p.stop();assert.equal(p.resume(),false);
});
