import {test} from 'node:test';
import assert from 'node:assert/strict';
import {popProblem,popChoices,popOperations} from '../../src/popit.js';
import {islandCards,islandChapters} from '../../src/dominican-adventure.js';
test('Beginner gets only small nonnegative additions and subtractions',()=>{const p={id:'p1'};assert.deepEqual(popOperations(p),['+','−']);assert.throws(()=>popProblem(p,'×'));for(const op of popOperations(p))for(let i=0;i<5;i++){const q=popProblem(p,op,i);assert.ok(q.total<=10);assert.ok(q.target>=0);assert.equal(q.target,op==='+'?q.a+q.b:q.a-q.b);}});
test('Older groups have exact multiplication and division with no remainder',()=>{for(const op of ['×','÷'])for(let i=0;i<5;i++){const q=popProblem({id:'p2'},op,i);assert.equal(q.total%q.columns,0);assert.equal(q.target,op==='×'?q.a*q.b:q.a/q.b);assert.equal(new Set(popChoices(q.target)).size,3);assert.ok(popChoices(q.target).includes(q.target));}});
import {advancedProblem,rememberPopit,fullPopitMarkup,initialPopit,togglePopit,popitFeedback} from '../../src/popit-advanced.js';
test('Older arithmetic involves regrouping and exact tables, optional twelve tables',()=>{for(const op of ['+','−','×','÷'])for(let i=0;i<5;i++)for(const extended of [false,true]){const q=advancedProblem(op,i,extended);assert.ok(Number.isInteger(q.target)&&q.target>=0&&q.target<=144);assert.equal(q.target,op==='+'?q.a+q.b:op==='−'?q.a-q.b:op==='×'?q.a*q.b:q.a/q.b);if(['+','−'].includes(op))assert.ok(q.a<=12&&q.b<=12&&q.target<=12);}assert.equal(advancedProblem('×',4,true).target,144);});
test('Complete Pop-it has 144 operable numbered bubbles and twelve axes',()=>{const html=fullPopitMarkup(true);assert.equal((html.match(/data-full-bubble=/g)||[]).length,144);assert.ok(html.includes('Ligne 12, colonne 12, 144'));assert.ok(html.includes('Ligne 6, colonne 4, 24'));assert.equal((fullPopitMarkup(false).match(/data-full-bubble=/g)||[]).length,144);assert.ok(fullPopitMarkup(false).includes('144, une unité'));assert.ok(!html.includes('style='));});
test('Help and errors persist across reopen without losing completed work or other profile',()=>{const p={id:'p2'},other={id:'p1'},q=advancedProblem('×');rememberPopit(p,q,{help:true},'2026-10-26');assert.equal(rememberPopit(p,q,{complete:true},'2026-10-26').assisted,true);assert.equal(rememberPopit(p,q,{incorrect:true},'2026-10-26').complete,true);assert.equal(rememberPopit(p,q,{complete:true},'2026-10-27').assisted,false);assert.equal(other.popit,undefined);assert.deepEqual(JSON.parse(JSON.stringify(p)),p);});

test('Units model adds to a fixed starting quantity and subtracts only existing units',()=>{
 for(const profile of [{id:'p1'},{id:'p2'}])for(const op of ['+','−'])for(let round=0;round<5;round++){
  const q=popProblem(profile,op,round),pressed=initialPopit(q);assert.equal(pressed.size,q.a);
  for(let i=0;i<q.b;i++)togglePopit(q,pressed,op==='+'?q.a+i:i);
  assert.equal(pressed.size,q.target);const n=pressed.size;togglePopit(q,pressed,99);assert.equal(pressed.size,n);
 }
});
test('Table selection explains products; division restricts to the divisor column and returns quotient',()=>{
 for(const op of ['×','÷'])for(const extended of [false,true])for(let round=0;round<5;round++){
  const q=advancedProblem(op,round,extended),pressed=initialPopit(q),row=op==='×'?q.a:q.target;
  if(op==='÷'){togglePopit(q,pressed,(q.b%12));assert.equal(pressed.size,0);}
  togglePopit(q,pressed,(row-1)*12+q.b-1);assert.equal(pressed.size,1);
  assert.ok(popitFeedback(q,pressed).includes(`${q.a} ${op} ${q.b} = ${q.target}`));
  assert.ok(fullPopitMarkup(true,pressed,q).includes('Ligne 12, colonne 12, 144'));
 }
});

import {togglePhysicalPopit,pressPopitAxis,physicalFeedback} from '../../src/popit-advanced.js';
test('Full physical board permits independent reversible presses on all 144 cells in every mode',()=>{
 for(const op of ['+','−','×','÷']){
  const q=advancedProblem(op),p=new Set(),html=fullPopitMarkup(['×','÷'].includes(op),p,q);
  assert.equal((html.match(/data-full-bubble=/g)||[]).length,144);
  assert.equal((html.match(/data-pop-axis=/g)||[]).length,24);assert.ok(!html.includes('disabled'));
  for(let i=0;i<144;i++)togglePhysicalPopit(p,i);assert.equal(p.size,144);
  for(let i=0;i<144;i++)togglePhysicalPopit(p,i);assert.equal(p.size,0);
 }
});
test('Full rows and columns toggle twelve actual units and preserve other pressed cells',()=>{
 const p=new Set();pressPopitAxis(p,'row',2);assert.equal(p.size,12);assert.ok(p.has(12)&&p.has(23));
 pressPopitAxis(p,'col',3);assert.equal(p.size,23);pressPopitAxis(p,'col',3);assert.equal(p.size,11);
 assert.equal(physicalFeedback(advancedProblem('×'),p,63),'6 × 4 = 24');
 assert.equal(physicalFeedback(advancedProblem('÷'),p,63),'24 ÷ 4 = 6');
});
