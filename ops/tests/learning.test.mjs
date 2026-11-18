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
test('Liana counts up to 9 999 through ordered rows of ten, while the first row stays at 1 000–1 999',()=>{
 const older={id:'p2',schoolContext:{stage:'3e année'}},younger={id:'p1',schoolContext:{stage:'1re année'}};
 const rows=numberRows(older);
 assert.ok(rows[firstNumberRow(older)].every(n=>n>=1000&&n<=1999));
 const step=(r)=>r.slice(1).map((n,i)=>n-r[i]);
 for(const key of ['L','M','N','P']){assert.equal(rows[key].length,10);assert.equal(new Set(rows[key]).size,10);assert.ok(rows[key].every(n=>Number.isInteger(n)&&n>=1000&&n<=9999),key);assert.ok(step(rows[key]).every(d=>d>0),key+' croissante');}
 assert.ok(step(rows.L.slice(0,9)).every(d=>d===1000),'L : de mille en mille');
 assert.ok(step(rows.M).every(d=>d===100)&&rows.M[0]===2000,'M : de cent en cent');
 assert.ok(step(rows.P).every(d=>d===100)&&rows.P[0]===9000,'P : de cent en cent');
 assert.ok(rows.N.slice(1).every(n=>new Set(String(n)).size===1),'N : chiffres répétés');
 assert.ok(Object.values(rows).flat().includes(9999));assert.ok(Math.max(...Object.values(rows).flat())===9999);
 for(const n of Object.values(rows).flat())assert.ok(numberWords(n)&&!/[0-9]|undefined/.test(numberWords(n)));
 assert.equal(rows.L,undefined||rows.L);assert.equal(numberRows(younger).L,undefined);assert.equal(numberRows(younger).M,undefined);
 assert.equal(numberWords(9999),'neuf mille neuf cent quatre-vingt-dix-neuf');
 assert.throws(()=>numberWords(10000),/9999/);
});
