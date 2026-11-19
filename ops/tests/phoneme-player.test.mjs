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
test('les consonnes se jouent seules (« chhhh »), sans voyelles autour; les voyelles restent telles quelles',async()=>{
 const {phonemeSrc,SOLO_PHONEMES}=await import('../../src/phoneme-player.js');
 const {readFile}=await import('node:fs/promises'),{createHash}=await import('node:crypto');
 assert.equal(phonemeSrc('ch'),'/icons/phonemes/ch-solo.mp3');assert.equal(phonemeSrc('a'),'/icons/phonemes/a.mp3');assert.equal(phonemeSrc('on'),'/icons/phonemes/on.mp3');
 const meta=JSON.parse(await readFile(new URL('../../icons/phonemes/solo-sources.json',import.meta.url),'utf8')).recordings;
 for(const id of SOLO_PHONEMES){
  const solo=await readFile(new URL(`../../icons/phonemes/${id}-solo.mp3`,import.meta.url)),orig=await readFile(new URL(`../../icons/phonemes/${id}.mp3`,import.meta.url));
  assert.ok(solo.length>2000&&solo.length<orig.length,id);
  const m=meta.find(x=>x.id===id);assert.ok(m&&m.derivedFromSha256===createHash('sha256').update(orig).digest('hex'),id+' : original modifié ou non documenté');
  assert.ok(m.endSec-m.startSec>=0.1,id);
 }
});
