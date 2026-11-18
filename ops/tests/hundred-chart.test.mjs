import test from 'node:test';
import assert from 'node:assert/strict';
import {createChart,newTarget,tapNumber,nextTarget,hintRow,rowOf,cellClass,chartMarkup} from '../../src/hundred-chart.js';
import {numberWords} from '../../src/numbers.js';
const fixed=values=>{let i=0;return ()=>values[i++%values.length];};
test('targets stay between 1 and 100 and never repeat the previous one',()=>{
 // Le premier tirage retombe sur le nombre précédent : la fonction doit en redemander un autre.
 for(let n=1;n<=100;n++){const t=newTarget(n,fixed([(n-1)/100,(n%100)/100]));assert.ok(t>=1&&t<=100);assert.notEqual(t,n);}
 assert.equal(newTarget(0,()=>0),1);assert.equal(newTarget(0,()=>.9999),100);
});
test('a tap is pronounced; a right tap is kept as found; a wrong tap explains with words',()=>{
 const s=createChart(fixed([.41]));assert.equal(s.target,42);
 const wrong=tapNumber(s,7);assert.deepEqual(wrong,{right:false,speak:'sept'});
 assert.match(s.msg,/sept/);assert.match(s.msg,/quarante-deux/);assert.equal(s.found.size,0);assert.equal(s.last,7);
 const right=tapNumber(s,42);assert.deepEqual(right,{right:true,speak:'quarante-deux'});
 assert.equal(s.found.has(42),true);assert.equal(s.ok,true);assert.match(s.msg,/Bravo/);
 assert.equal(tapNumber(s,0),null);assert.equal(tapNumber(s,101),null);assert.equal(tapNumber(s,4.5),null);assert.equal(tapNumber(s,'7'),null);
});
test('after two misses the row of the number to find is lit, then cleared by the next target',()=>{
 const s=createChart(fixed([.41,.77]));assert.equal(hintRow(s),-1);
 tapNumber(s,1);assert.equal(hintRow(s),-1);tapNumber(s,2);assert.equal(hintRow(s),rowOf(42));assert.equal(rowOf(42),4);
 const lit=Array.from({length:100},(_,i)=>i+1).filter(n=>cellClass(s,n).includes('hint'));assert.deepEqual(lit,[41,42,43,44,45,46,47,48,49,50]);
 nextTarget(s);assert.equal(hintRow(s),-1);assert.notEqual(s.target,42);assert.equal(s.msg,'');
});
test('the chart shows ten rows of ten, marks the end of each ten and names the target in letters',()=>{
 const s=createChart(fixed([.99]));assert.equal(s.target,100);
 const html=chartMarkup(s);
 assert.equal((html.match(/data-hundred-n="/g)||[]).length,100);
 for(const n of [1,50,100])assert.match(html,new RegExp(`data-hundred-n="${n}">${n}<`));
 assert.equal(Array.from({length:100},(_,i)=>cellClass(s,i+1)).filter(c=>c.includes('ten-end')).length,10);
 assert.match(html,/data-hundred-word>cent</);assert.equal(numberWords(100),'cent');
 assert.match(html,/data-hundred-hear/);assert.doesNotMatch(html,/data-action=/);
});
test('every number from 1 to 100 can be asked in letters and has a spoken form',()=>{
 for(let n=1;n<=100;n++){const w=numberWords(n);assert.ok(/^[a-zéèêîôûç\- ]+$/.test(w),w);}
 assert.equal(numberWords(80),'quatre-vingts');assert.equal(numberWords(71),'soixante et onze');assert.equal(numberWords(99),'quatre-vingt-dix-neuf');
});
