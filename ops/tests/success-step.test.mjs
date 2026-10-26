import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scheduleSuccess} from '../../src/success-step.js';
import {advancedProblem} from '../../src/popit-advanced.js';
test('Success advances once without waiting for an audio callback',()=>{let tick,n=0; scheduleSuccess(()=>n++,{set:f=>(tick=f,1),clear:()=>{},hidden:()=>false});tick();tick();assert.equal(n,1);});
test('Leaving or pausing cancels even an already queued success callback',()=>{let tick,n=0;const cancel=scheduleSuccess(()=>n++,{set:f=>(tick=f,1),clear:()=>{},hidden:()=>false});cancel();tick();assert.equal(n,0);});
test('Hidden pages never advance unseen',()=>{let tick,n=0;scheduleSuccess(()=>n++,{set:f=>(tick=f,1),clear:()=>{},hidden:()=>true});tick();assert.equal(n,0);});
test('All Pop-it calculations fit the twelve-by-twelve aid',()=>{for(let i=0;i<10;i++)for(const extended of [false,true])for(const op of ['+','−','×','÷']){const q=advancedProblem(op,i,extended);assert.ok(Number.isInteger(q.target)&&q.target>=0);if(op==='×')assert.ok(q.a<=12&&q.b<=12);else if(op==='÷')assert.ok(q.b<=12&&q.target<=12);else assert.ok(q.a<=12&&q.b<=12&&q.target<=12);}});
