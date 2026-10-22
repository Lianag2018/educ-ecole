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
test('rendering escapes text and attributes, and explains approximate timing',()=>{
 const html=guidedMarkup('<img src=x> "bonjour"');assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;'));assert.ok(html.includes('approximatifs'));
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
