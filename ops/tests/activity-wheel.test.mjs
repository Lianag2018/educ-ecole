import test from 'node:test';import assert from 'node:assert/strict';
globalThis.matchMedia=()=>({matches:false});
const {buildStrip,pickTarget}=await import('../../src/activity-wheel.js');
test('le rouleau s’arrête sur la cible et ne répète pas la même activité côte à côte',()=>{
 for(const n of [2,3,5,8,13])for(let t=0;t<n;t++){const pool=Array.from({length:n},(_,i)=>({i})),{strip,land}=buildStrip(pool,t);
  assert.equal(strip[land],t);assert.ok(strip.length>=26&&land>=1&&land<strip.length-1);
  for(let k=1;k<strip.length;k++)if(n>2&&Math.abs(k-land)<=1)assert.notEqual(strip[k],strip[k-1],`doublon près de l’arrêt n=${n}`);
  assert.ok(strip.every(i=>i>=0&&i<n));}
});
test('cible dans la liste, rien si la liste est vide',()=>{assert.equal(pickTarget([]),-1);assert.ok([0,1,2].includes(pickTarget([1,2,3],()=>0.99)));});
