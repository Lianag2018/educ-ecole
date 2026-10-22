import test from 'node:test';
import assert from 'node:assert/strict';
import {bank} from '../../src/content.js';
import {socialFor} from '../../src/learning.js';
import {spokenActivity} from '../../src/speech.js';
import {syllables,decodingWords,choiceSpeech,oralQuestion,oralFeedback,wordLesson} from '../../src/oral-learning.js';
import {narrationCatalog} from '../narration-catalog.mjs';
test('phonics models use French context and preserve original orthography',()=>{assert.equal(bank.find(q=>q.id==='so3').text,'pain');assert.equal(spokenActivity(bank.find(q=>q.id==='so3')),'Du pain. Le pain.');assert.equal(choiceSpeech('main'),'Une main.');assert.deepEqual(syllables.lapin,['la','pin']);assert.equal(syllables.bibliothèque.join(''),'bibliothèque');});
test('young social and all young reading choices/questions/feedback have recorded catalog entries',()=>{const texts=new Set(narrationCatalog().map(c=>c.text));for(const q of [...bank,socialFor({id:'p1'})]){assert.ok(texts.has(spokenActivity(q)));assert.ok(texts.has(oralQuestion(q)));for(const c of q.choices)assert.ok(texts.has(choiceSpeech(c)));for(const result of ['correct','incorrect','help'])assert.ok(texts.has(oralFeedback(q,result)));}assert.ok(decodingWords(socialFor({id:'p1'})).includes('bibliothèque'));assert.ok(texts.has(wordLesson('lapin')));});
