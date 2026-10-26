import {test} from 'node:test';
import assert from 'node:assert/strict';
import {popProblem,popChoices,popOperations} from '../../src/popit.js';
import {islandCards,islandChapters} from '../../src/dominican-adventure.js';
test('Beginner gets only small nonnegative additions and subtractions',()=>{const p={id:'p1'};assert.deepEqual(popOperations(p),['+','−']);assert.throws(()=>popProblem(p,'×'));for(const op of popOperations(p))for(let i=0;i<5;i++){const q=popProblem(p,op,i);assert.ok(q.total<=10);assert.ok(q.target>=0);assert.equal(q.target,op==='+'?q.a+q.b:q.a-q.b);}});
test('Older groups have exact multiplication and division with no remainder',()=>{for(const op of ['×','÷'])for(let i=0;i<5;i++){const q=popProblem({id:'p2'},op,i);assert.equal(q.total%q.columns,0);assert.equal(q.target,op==='×'?q.a*q.b:q.a/q.b);assert.equal(new Set(popChoices(q.target)).size,3);assert.ok(popChoices(q.target).includes(q.target));}});
