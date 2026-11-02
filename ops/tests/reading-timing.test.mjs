import test from 'node:test';
import assert from 'node:assert/strict';
import {verifiedReadingPosition} from '../../src/reading-timing.js';
import {NarrationSpeaker} from '../../src/narration.js';
import {readingCues,guidedMarkup,updateReadingCue} from '../../src/guided-reading.js';
const text='Cauchemar.';
// Synthetic timings only test the contract; they are not narration assets.
const entry={text,reviewed:true,syllables:[
 {start:1,end:1.2,charIndex:0,charEnd:9,partIndex:0},
 {start:1.2,end:1.7,charIndex:0,charEnd:9,partIndex:1},
 {start:1.7,end:2,charIndex:0,charEnd:9,partIndex:2},
 {start:2,end:2.4,charIndex:9,charEnd:10,partIndex:0}
]};
test('only reviewed exact-text timings are eligible; intervals are half open',()=>{
 assert.equal(verifiedReadingPosition({...entry,reviewed:false},text,1),null);
 assert.equal(verifiedReadingPosition(entry,'autre texte',1),null);
 assert.equal(verifiedReadingPosition(entry,text,1.2).partIndex,1);
 assert.equal(verifiedReadingPosition(entry,text,1.95).partIndex,2);
 assert.equal(verifiedReadingPosition(entry,text,2.2).charIndex,9);
 assert.equal(verifiedReadingPosition(entry,text,.8).charIndex,-1);
 assert.equal(verifiedReadingPosition(entry,text,2.4).charIndex,-1);
 assert.equal(verifiedReadingPosition({...entry,syllables:[entry.syllables[1],entry.syllables[0]]},text,1.3),null);
});
test('three visible reading units, silent letter and liaison stay distinct',()=>{
 assert.deepEqual(readingCues(text).tokens[0].parts,['Cau','che','mar']);
 assert.match(guidedMarkup(text),/syllable-2/);
 assert.doesNotMatch(guidedMarkup(text),/silent-letter/);
 assert.match(guidedMarkup('Les animaux.'),/liaison-letter/);
 assert.match(guidedMarkup('Les animaux.'),/silent-letter">x/);
});
test('estimated word fractions never select a syllable; explicit cue selects one',()=>{
 const active=new Set();const parts=Array.from({length:3},(_,j)=>({classList:{toggle:(c,on)=>on?active.add(j):active.delete(j)}}));
 const token={classList:{toggle(){}},querySelectorAll:()=>parts};
 const box={dataset:{guidedText:text},querySelectorAll:()=>[token],querySelector:()=>null};
 const root={querySelector:()=>box};
 updateReadingCue(root,text,{charIndex:0,wordProgress:.8,approximate:false});assert.equal(active.size,0);
 updateReadingCue(root,text,{charIndex:0,partIndex:1,approximate:false});assert.deepEqual([...active],[1]);
 updateReadingCue(root,text,{charIndex:-1,partIndex:-1,approximate:false});assert.equal(active.size,0);
});
test('audio uses its currentTime including speed change and backward seek; stop invalidates callbacks',async()=>{
 class Audio{pause(){}setAttribute(){}removeAttribute(){}play(){return Promise.resolve();}}
 const file='b'.repeat(64)+'.mp3',events=[];
 const speaker=new NarrationSpeaker({AudioClass:Audio,fallback:{stop(){}},fetcher:async url=>({ok:true,json:async()=>({version:1,clips:url.includes('alignment')?{[file]:entry}:{[text]:file}})})});
 await Promise.all([speaker.ready,speaker.alignmentReady]);speaker.speak(text,{onProgress:e=>events.push(e)});
 speaker.audio.duration=3;speaker.audio.currentTime=1.8;speaker.audio.ontimeupdate();assert.equal(events.at(-1).partIndex,2);
 speaker.setSpeed(.75);speaker.audio.currentTime=1.3;speaker.audio.ontimeupdate();assert.equal(events.at(-1).partIndex,1);
 const stale=speaker.audio.ontimeupdate,count=events.length;speaker.stop();stale();assert.equal(events.length,count);
});
