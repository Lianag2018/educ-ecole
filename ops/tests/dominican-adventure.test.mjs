import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,answer,save,load} from '../../src/engine.js';
import {islandChapters,islandCards,islandVisual,islandProgress,nextIsland} from '../../src/dominican-adventure.js';
import {travelHome,travelPoints} from '../../src/voyage.js';
const day='2026-10-26';
test('Three connected chapters have nine distinct activities per profile and valid choices',()=>{
 const ids=new Set();
 for(const p of fresh().profiles)for(const c of islandChapters){const qs=islandCards(p,c.id);assert.equal(qs.length,3);for(const q of qs){assert.ok(!ids.has(q.id));ids.add(q.id);assert.equal(new Set(q.choices).size,3);assert.ok(q.choices[q.answer]);assert.equal(q.island,c.id);}}
 assert.equal(ids.size,18);assert.deepEqual(islandCards({id:'p1'},'unknown'),[]);
});
test('Counted drawings exactly match the numeric answer, with varied answer positions',()=>{
 const positions=[];
 for(const c of islandChapters){const q=islandCards({id:'p1'},c.id)[1];assert.equal((islandVisual(q).match(/<svg /g)||[]).length,q.islandCount);assert.equal(Number(q.choices[q.answer]),q.islandCount);positions.push(q.answer);}
 assert.equal(new Set(positions).size,3);
});
test('Older arithmetic and base-ten illustrations describe the same operands',()=>{
 for(const c of islandChapters){const q=islandCards({id:'p2'},c.id)[1],[a,op,b]=q.islandMath.split(' '),n=op==='+'?+a + +b:+a - +b;assert.equal(+q.choices[q.answer],n);const html=islandVisual(q);assert.equal((html.match(/class="ten"/g)||[]).length,Math.floor(a/10)+Math.floor(b/10));assert.equal((html.match(/class="one"/g)||[]).length,a%10+b%10);assert.ok(html.includes('Une barre = 10'));}
});
test('Older reading develops sequencing, pronoun reference and summary beyond word matching',()=>{
 const qs=islandChapters.map(c=>islandCards({id:'p2'},c.id)[2]);assert.match(qs[0].prompt,/ordre/);assert.match(qs[1].prompt,/elles/);assert.match(qs[2].prompt,/fin/);for(const [i,q]of qs.entries())assert.notEqual(q.prompt,islandCards({id:'p1'},islandChapters[i].id)[2].prompt);
});
test('Exploring a chapter is distinct from unaided success, repeats do not duplicate progress',()=>{
 const [p,p2]=fresh().profiles,c=islandChapters[0],qs=islandCards(p,c.id);assert.equal(nextIsland(p).id,'bateau');answer(p,qs[0],'incorrect',day);answer(p,qs[0],'correct',day);answer(p,qs[1],'help',day,'Maths');answer(p,qs[2],'correct',day);
 assert.deepEqual(islandProgress(p,c),{explored:3,success:1,total:3});assert.equal(nextIsland(p).id,'palmiers');assert.deepEqual(islandProgress(p2,c),{explored:0,success:0,total:3});assert.equal(travelPoints(p),5);
 const data={};save({setItem:(k,v)=>data[k]=v},{...fresh(),profiles:[p,p2]});assert.deepEqual(islandProgress(load({getItem:k=>data[k]}).profiles[0],c),{explored:3,success:1,total:3});
});
test('Adventure home leads to a meaningful chapter, replaces the four generic destination tiles',()=>{
 const p=fresh().profiles[0],html=travelHome(p);assert.ok(html.includes('dominicaine-bateau.webp'));assert.ok(!html.includes('travel-destinations'));assert.ok(html.includes('data-island-chapter="bateau"'));for(const c of islandChapters)assert.ok(html.includes(c.verb));assert.ok(html.includes('Nos autres petits contes'));assert.ok(html.includes('data-travel-quiet'));
});
test('All new educational narration is present without removing existing narration',async()=>{
 const {narrationCatalog}=await import('../narration-catalog.mjs');const texts=new Set(narrationCatalog().map(x=>x.text));for(const id of ['p1','p2'])for(const c of islandChapters)for(const q of islandCards({id},c.id))assert.ok(texts.has(q.explanation));
});
