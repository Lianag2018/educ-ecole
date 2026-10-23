import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syllablePartsFor,localPhonemeForKalulu} from '../../src/syllable-audio.js';
import {firstBlends} from '../../src/first-reading.js';
test('first grade m + a and all phonemes have local audio',()=>{
 const q=firstBlends.find(q=>q.text==='m + a');
 assert.deepEqual(syllablePartsFor(q).map(p=>localPhonemeForKalulu(p.id)),['m','a']);
 for(const q of firstBlends)for(const part of syllablePartsFor(q)){
  assert.ok(part&&localPhonemeForKalulu(part.id),q.text);
 }
});
test('local phoneme mapping never guesses filenames',()=>{
 for(const id of ['../../private','random','m',''])assert.equal(localPhonemeForKalulu(id),null);
});
test('phoneme buttons use local player, syllables keep their player',()=>{
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.ok(app.includes("category==='sons'?localPhonemeForKalulu(name):null"));
 assert.ok(app.includes('phonemePlayer.play(local)'));
 assert.ok(app.includes('syllablePlayer.play(category,name,status)'));
 assert.ok(app.includes("if(a==='silence'){syllablePlayer.stop();oralCheck.stop();phonemePlayer.stop()"));
});
