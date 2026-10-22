import test from 'node:test';
import assert from 'node:assert/strict';
import {firstSounds,firstBlends,firstWords} from '../../src/first-reading.js';
import {spokenActivity} from '../../src/speech.js';
import {oralQuestion,wordLesson} from '../../src/oral-learning.js';
import {narrationCatalog} from '../narration-catalog.mjs';
test('beginner foundations teach distinct u, ou and on with spoken instructions',()=>{
 const cards=[...firstSounds,...firstBlends,...firstWords];
 assert.equal(cards.length,28);assert.equal(new Set(cards.map(q=>q.id)).size,28);
 for(const q of cards){assert.ok(q.choices[q.answer]);assert.ok(oralQuestion(q).includes(q.lesson));assert.ok(!spokenActivity(q).includes('+'));}
 const by=id=>firstSounds.find(q=>q.id==='first-sound-'+id);
 assert.equal(by('u').choices[by('u').answer],'lune');assert.equal(by('ou').choices[by('ou').answer],'roue');assert.equal(by('on').choices[by('on').answer],'ballon');
 assert.equal(wordLesson('lapin'),'la. pin. lapin.');assert.equal(wordLesson('midi'),'mi. di. midi.');
});
test('phonics recordings carry French pronunciation instructions and distinct cache hashes',()=>{
 const c=narrationCatalog();
 for(const text of ['Du pain. Le pain.','Une main.','la.','la. pin. lapin.']){const clip=c.find(x=>x.text===text);assert.ok(clip,text);assert.match(clip.instructions,/Ne bascule jamais en anglais/);assert.match(clip.instructions,/u de lune/);}
});
