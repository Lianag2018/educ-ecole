import test from 'node:test';
import assert from 'node:assert/strict';
import {PhonemePlayer} from '../../src/phoneme-player.js';
function harness(){const states=[],audios=[];const player=new PhonemePlayer({onState:s=>states.push(s),createAudio:src=>{const a={src,pause(){this.paused=true;},removeAttribute(){},load(){},play(){return Promise.resolve();}};audios.push(a);return a;}});return {player,states,audios};}
test('replaying or changing a phoneme interrupts prior audio and ignores stale events',async()=>{
 const {player,states,audios}=harness();await player.play('u');const old=audios[0];old.onplaying();await player.play('ou');assert.equal(old.paused,true);const count=states.length;old.onerror();old.onended();assert.equal(states.length,count);assert.equal(audios[1].src,'/icons/phonemes/ou.mp3');assert.equal(audios[1].playbackRate,1);audios[1].onplaying();assert.equal(states.at(-1),'playing');player.stop();assert.equal(audios[1].paused,true);audios[1].onended();assert.equal(states.at(-1),'idle');
});
test('failed playback reports an error without synthesizing the phoneme',async()=>{
 const states=[];const player=new PhonemePlayer({onState:s=>states.push(s),createAudio:()=>({play:()=>Promise.reject(new Error('blocked')),pause(){},removeAttribute(){},load(){}})});await player.play('f');assert.equal(states.at(-1),'error');
});
