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
