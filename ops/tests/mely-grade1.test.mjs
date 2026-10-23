import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh} from '../../src/engine.js';
import {melyReading,melyMath,melyWordBlocks,melySteps} from '../../src/mely-grade1.js';
import {readingBank,mathsFor} from '../../src/learning.js';
import {schoolMathLinks} from '../../src/worlds.js';
test('grade one corpus is well formed',()=>{assert.equal(melyWordBlocks.flat().length,100);assert.equal(melySteps.length,15);assert.equal(melyReading.length,16);assert.equal(melyMath.length,16);for(const q of [...melyReading,...melyMath]){assert.ok(q.choices[q.answer]);assert.equal(new Set(q.choices).size,q.choices.length);}});
test('only first-grade child gets new cards',()=>{const [a,b]=fresh().profiles;assert.ok(melyReading.every(q=>readingBank(a).some(x=>x.id===q.id)));assert.ok(melyMath.every(q=>mathsFor(a).some(x=>x.id===q.id)));assert.ok(melyReading.every(q=>!readingBank(b).some(x=>x.id===q.id)));assert.ok(melyMath.every(q=>!mathsFor(b).some(x=>x.id===q.id)));assert.ok(readingBank(a).some(q=>q.id==='sy1'));});
test('school portal is not public credential storage',()=>{const [a,b]=fresh().profiles;assert.ok(schoolMathLinks(a).includes('ipluseleve.ca'));assert.ok(!schoolMathLinks(b).includes('ipluseleve.ca'));assert.ok(!schoolMathLinks(a).includes('402059'));});
