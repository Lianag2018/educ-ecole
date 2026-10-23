import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recordedSyllable,recordedPieces,syllableForExercise,syllableForChoice} from '../../src/syllable-audio.js';
import {kaluluUrl,createKaluluPlayer} from '../../src/kalulu-bank.js';
test('first-grade full syllable recordings, not letter names',()=>{
 for(const [written,expected] of [['m + a','ma'],['l + i','li'],['m + ou','mou'],['ch + a','cha'],['fa','fa'],['la + pin',null],['3 + 2',null]]){
  assert.equal(recordedSyllable(written),expected);
  if(expected)assert.ok(kaluluUrl('syllabes',expected).endsWith('/'+expected+'.mp3'));
 }
 assert.deepEqual(recordedPieces('la + pin'),['la',null]);
 assert.equal(syllableForExercise({skill:'mots',text:'ma'}),null);
 assert.equal(syllableForExercise({skill:'syllabes',text:'m + a'}),'ma');
 assert.equal(syllableForChoice({skill:'syllabes'},'fa'),'fa');
 assert.equal(syllableForChoice({skill:'mots'},'ma'),null);
});
test('exercise listen, choice audio, pieces, and stop share recorded route',()=>{
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 for(const marker of ['syllableForExercise(session.items[session.index])','syllableForChoice(q,choice)','data-syllable-piece','recordedPieces(q.text)','blendedSyllablePlayer.stop()'])assert.ok(app.includes(marker),marker);
 assert.doesNotMatch(app,/Oscillator|BlendPilot|data-blend-pilot/);
});
test('recorded player stops old clip and ignores late callback',()=>{
 const audios=[],messages=[];
 const player=createKaluluPlayer({createAudio:src=>{const a={src,paused:false,play(){return Promise.resolve();},pause(){this.paused=true;},removeAttribute(){},load(){}};audios.push(a);return a;}});
 player.play('syllabes','ma',s=>messages.push(s));const stale=audios[0].onended;
 player.play('syllabes','fa',s=>messages.push(s));stale();assert.equal(audios[0].paused,true);
 assert.equal(messages.filter(s=>s.includes('tour')).length,0);
 audios[1].onended();assert.equal(messages.filter(s=>s.includes('tour')).length,1);
 player.stop();assert.equal(audios[1].paused,true);
});
