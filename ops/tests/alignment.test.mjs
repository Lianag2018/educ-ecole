import test from 'node:test';
import assert from 'node:assert/strict';
import {alignWords} from '../align-narration.mjs';
import {NarrationSpeaker} from '../../src/narration.js';
test('alignment preserves original accents, apostrophes and repeated word offsets',()=>{
 const cues=alignWords('Les sœurs, les étoiles.',[{word:'Les',start:0,end:.3},{word:'soeurs',start:.3,end:1},{word:'les',start:1.5,end:1.8},{word:'étoiles.',start:1.8,end:2.5}]);
 assert.deepEqual(cues.map(c=>c.charIndex),[0,4,11,15]);
 assert.equal(alignWords('Le chat.',[{word:'Le chien',start:0,end:1}]),null);
 assert.equal(alignWords('Le chat.',[{word:'Le',start:1,end:2},{word:'chat',start:1,end:3}]),null);
 assert.equal(alignWords('Le chat.',[{word:'Le',start:0,end:1}]),null);
});
test('recorded word positions follow time through slow playback, seeking, replay and cancellation',async()=>{
 class Audio{pause(){}setAttribute(){}removeAttribute(){}play(){return Promise.resolve();}}
 const file='a'.repeat(64)+'.mp3',text='Les amis.';
 const p=new NarrationSpeaker({fallback:{stop(){}},AudioClass:Audio,fetcher:async url=>({ok:true,json:async()=>url.includes('alignment')?{version:1,clips:{[file]:{text,cues:[{start:.2,end:.5,charIndex:0},{start:1,end:2,charIndex:4}]}}}:{version:1,clips:{[text]:file}}})});
 await Promise.all([p.ready,p.alignmentReady]);const events=[];
 p.speak(text,{speed:'very-slow',onProgress:e=>events.push(e)});
 p.audio.duration=3;p.audio.currentTime=0;p.audio.ontimeupdate();assert.equal(events.at(-1).charIndex,-1);
 p.audio.currentTime=1.2;p.audio.ontimeupdate();assert.equal(events.at(-1).charIndex,4);assert.equal(events.at(-1).approximate,false);
 p.audio.currentTime=.3;p.audio.ontimeupdate();assert.equal(events.at(-1).charIndex,0);
 const stale=p.audio.ontimeupdate;p.stop();const count=events.length;stale();assert.equal(events.length,count);
 p.speak(text,{onProgress:e=>events.push(e)});p.audio.currentTime=0;p.audio.ontimeupdate();assert.equal(events.at(-1).charIndex,-1);
});
