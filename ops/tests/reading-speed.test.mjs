import test from 'node:test';
import assert from 'node:assert/strict';
import {NarrationSpeaker} from '../../src/narration.js';
import {playbackSpeed,ReadingSpeaker} from '../../src/speech.js';
test('speed changes keep media position, pitch and measured word anchor',async()=>{
 class Audio{pause(){}setAttribute(){}removeAttribute(){}play(){this.starts=(this.starts||0)+1;return Promise.resolve();}}
 const file='a'.repeat(64)+'.mp3',text='Les amis';
 const p=new NarrationSpeaker({fallback:{stop(){}},AudioClass:Audio,fetcher:async url=>({ok:true,json:async()=>url.includes('alignment')?{version:1,clips:{[file]:{text,cues:[{start:0,end:.5,charIndex:0},{start:1,end:2,charIndex:4}]}}}:{version:1,clips:{[text]:file}}})});
 await Promise.all([p.ready,p.alignmentReady]);const events=[];p.speak(text,{speed:1,onProgress:e=>events.push(e)});
 p.audio.currentTime=1.3;p.audio.duration=2.5;
 for(const speed of [.6,1,1.5]){p.setSpeed(speed);p.audio.ontimeupdate();assert.equal(p.audio.currentTime,1.3);assert.equal(p.audio.starts,1);assert.equal(p.audio.playbackRate,speed);assert.equal(p.audio.preservesPitch,true);assert.equal(events.at(-1).charIndex,4);}
 assert.equal(playbackSpeed('very-slow'),.8);assert.equal(playbackSpeed('bad'),1);assert.equal(playbackSpeed(9),1.5);
});
test('native voice resumes at last known word and preserves original character offsets',()=>{
 const utterances=[];class Utterance{constructor(text){this.text=text;}}
 const p=new ReadingSpeaker({synth:{cancel(){},getVoices(){return[];},speak(u){utterances.push(u);}},Utterance,setTimer(){},clearTimer(){}});
 const cues=[];p.speak('Les amis lisent',{onProgress:e=>cues.push(e.charIndex)});
 utterances.at(-1).onboundary({charIndex:4});p.setSpeed(1.5);assert.equal(utterances.at(-1).text,'amis lisent');
 utterances.at(-1).onboundary({charIndex:5});assert.equal(cues.at(-1),9);
 p.setSpeed(.8);assert.equal(utterances.at(-1).text,'lisent');utterances.at(-1).onboundary({charIndex:0});assert.equal(cues.at(-1),9);
});
