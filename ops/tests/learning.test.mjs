import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,select,answer,generate,load,save} from '../../src/engine.js';
import {skillCards,storyCards,mathsFor,socialFor,numberRows,firstNumberRow} from '../../src/learning.js';
test('each child gets a distinct starting mission and subject bank',()=>{
 const [young,older]=fresh().profiles;
 const first=select(young,'2026-10-21'),second=select(older,'2026-10-21');
 assert.equal(first.length,6);assert.equal(second.length,6);
 assert.ok(second.every(q=>!first.some(x=>x.id===q.id)));
 for(const skill of ['syllabes','sons'])assert.ok(skillCards(older,skill).every(q=>!skillCards(young,skill).some(x=>x.id===q.id)));
 assert.ok(storyCards(young).every(q=>q.grade===1));assert.ok(storyCards(older).every(q=>q.grade===3));
 assert.ok(mathsFor(young).every(q=>!mathsFor(older).some(x=>x.id===q.id)));
 assert.notEqual(socialFor(young).id,socialFor(older).id);
 assert.ok(Object.values(numberRows(young)).flat().every(n=>n<100));
 assert.ok(numberRows(older)[firstNumberRow(older)].every(n=>n>=1000));
 assert.equal(numberRows(older).A[6],307);
});
test('personal work and difficulty survive reload without crossing profiles',()=>{
 const s=fresh(),[young,older]=s.profiles;older.assignments=generate('montgolfière');older.calibrated=true;
 const q=skillCards(older,'syllabes')[0];answer(older,q,'incorrect','2026-10-21');
 assert.ok(select(older,'2026-10-21').some(x=>x.id===q.id));
 assert.ok(select(older,'2026-10-21').some(x=>x.text==='montgolfière'));
 assert.equal(young.history.length,0);assert.equal(young.assignments.length,0);
 const storage={getItem:()=>storage.data,setItem:(_,v)=>storage.data=v};save(storage,s);
 const restored=load(storage);assert.deepEqual(restored,s);
 older.schoolContext.stage='1re année';assert.equal(skillCards(older,'syllabes')[0].id,'sy1');
});
