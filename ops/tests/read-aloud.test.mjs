import test from 'node:test';import assert from 'node:assert/strict';
import {ADVANCED_ORDER,createReadAloud,markRead,nextPosition,rowComplete,dotsMarkup} from '../../src/read-aloud.js';
test('"Bien dit" avance au prochain nombre non lu de la ligne',()=>{
 const s=createReadAloud();markRead(s,'J',0);
 const n=nextPosition(s,ADVANCED_ORDER,'J',0);
 assert.deepEqual(n,{row:'J',index:1,rowDone:false,finished:false});
});
test('ligne terminée → ligne suivante; dernière ligne → fini',()=>{
 const s=createReadAloud();for(let i=0;i<10;i++)markRead(s,'J',i);
 assert.ok(rowComplete(s,'J'));
 assert.deepEqual(nextPosition(s,ADVANCED_ORDER,'J',9),{row:'L',index:0,rowDone:true,finished:false});
 for(let i=0;i<10;i++)markRead(s,'P',i);
 const end=nextPosition(s,ADVANCED_ORDER,'P',9);assert.equal(end.finished,true);assert.equal(end.row,'J');
});
test('les nombres déjà lus sont sautés et les points reflètent la progression',()=>{
 const s=createReadAloud();markRead(s,'L',1);markRead(s,'L',0);
 assert.equal(nextPosition(s,ADVANCED_ORDER,'L',0).index,2);
 assert.match(dotsMarkup(s,'L',2),/<i class="done"><\/i><i class="done"><\/i><i class="now"><\/i>/);
});
