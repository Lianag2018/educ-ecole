import test from 'node:test';
import assert from 'node:assert/strict';
import {syllableAudioFor,syllablePartsFor,syllableChoiceAudio} from '../../src/syllable-audio.js';
import {firstBlends,firstWords} from '../../src/first-reading.js';
import {readFileSync} from 'node:fs';
test('all eight first-grade phoneme blends have full recordings and both phonemes',()=>{
 for(const q of firstBlends){
  const result=syllableAudioFor(q);assert.ok(result?.whole,q.text);
  assert.equal(result.parts.length,2,q.text);
  assert.ok(syllablePartsFor(q).every(x=>x?.category==='sons'),q.text);
 }
});
test('multi-syllable words offer recorded pieces without inventing a whole word',()=>{
 for(const q of firstWords){
  const pieces=syllablePartsFor(q);
  assert.ok(pieces.length>=2,q.text);
  assert.ok(pieces.some(Boolean),q.text);
  assert.equal(syllableAudioFor(q),null,q.text);
 }
});
test('isolated syllable and choice can use their recording, not arithmetic',()=>{
 assert.equal(syllableAudioFor({skill:'syllabes',text:'ma'}).whole,'ma');
 assert.equal(syllableChoiceAudio({skill:'syllabes'},'fa'),'fa');
 assert.equal(syllableAudioFor({skill:'mots',text:'ma'}),null);
 assert.equal(syllableAudioFor({skill:'syllabes',text:'3 + 2'}),null);
});
test('the UI routes every piece through its recorded category and preserves fallback',()=>{
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(app,/playSyllable\(part\.category,part\.id\)/);
 assert.match(app,/syllablePartsFor\(q\)/);
 assert.match(app,/if\(recorded\)\{playSyllable\('syllabes',recorded\.whole\)/);
 assert.match(app,/speakText\(choiceSpeech\(choice\)\)/);
});
