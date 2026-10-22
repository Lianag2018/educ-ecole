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
 assert.ok(numberRows(older)[firstNumberRow(older)].every(n=>n>=1000&&n<=1999));
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
 older.schoolContext.stage='1re année';assert.deepEqual(skillCards(older,'syllabes'),skillCards(young,'syllabes'));
});

import {numberWords} from '../../src/numbers.js';
test('French spoken numbers cover zero through 1999 with no digit-by-digit reading',()=>{
 for(const [n,words] of [[0,'zéro'],[71,'soixante et onze'],[80,'quatre-vingts'],[81,'quatre-vingt-un'],[91,'quatre-vingt-onze'],[200,'deux cents'],[307,'trois cent sept'],[999,'neuf cent quatre-vingt-dix-neuf'],[1000,'mille'],[1001,'mille un'],[1010,'mille dix'],[1999,'mille neuf cent quatre-vingt-dix-neuf']])assert.equal(numberWords(n),words);
 for(let n=0;n<=1999;n++)assert.ok(numberWords(n)&&!/[0-9]|undefined/.test(numberWords(n)));
});

import {tablePractice} from '../../src/week-plan.js';
test('weekly arithmetic covers addition and subtraction tables 1 to 6',()=>{
 for(let table=1;table<=6;table++)for(const op of ['+','−']){
 const cards=tablePractice(table,op);assert.equal(cards.length,12);
 cards.forEach((q,i)=>assert.equal(Number(q.choices[q.answer]),op==='+'?table+i+1:i+1));
 }
});
