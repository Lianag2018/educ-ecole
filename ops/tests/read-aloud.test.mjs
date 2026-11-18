import test from 'node:test';import assert from 'node:assert/strict';
import {createGrid,drawNumbers,markDone,nextIndex,select,isFinished,gridMarkup,GRID_SIZE} from '../../src/read-aloud.js';
test('la grille a 80 nombres différents de 1 000 à 9 999, mélangés',()=>{
 const g=createGrid();assert.equal(g.numbers.length,80);assert.equal(new Set(g.numbers).size,80);
 assert.ok(g.numbers.every(n=>Number.isInteger(n)&&n>=1000&&n<=9999));
 const sorted=[...g.numbers].sort((a,b)=>a-b);assert.notDeepEqual(g.numbers,sorted);
 assert.equal((gridMarkup(g).match(/data-read-cell=/g)||[]).length,80);
});
test('le tirage fonctionne même avec un hasard très répétitif',()=>{
 let i=0;const rnd=()=>((i++*0.6180339887)%1);
 assert.equal(new Set(drawNumbers(rnd)).size,GRID_SIZE);
});
test('« Bien dit » avance au prochain nombre pas encore lu, et la fin est détectée',()=>{
 const g=createGrid();select(g,5);markDone(g);assert.equal(nextIndex(g),6);
 g.current=79;assert.equal(nextIndex(g),0);
 for(let i=0;i<80;i++)markDone(g,i);assert.equal(nextIndex(g),-1);assert.ok(isFinished(g));
});
test('on ne peut pas éclairer un nombre déjà lu',()=>{
 const g=createGrid();markDone(g,3);g.current=0;select(g,3);assert.equal(g.current,0);select(g,99);assert.equal(g.current,0);
});
