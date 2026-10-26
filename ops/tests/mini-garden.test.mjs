import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,answer,save,load} from '../../src/engine.js';
import {miniZones,miniCards,miniTier,miniSession,miniGarden,miniVisual} from '../../src/mini-garden.js';
import {worldHome} from '../../src/worlds.js';

test('all original challenges have three distinct answers and bounded quantities',()=>{
 const ids=new Set();
 for(const z of miniZones)for(const tier of [1,2,3])for(const q of miniCards(z.id,tier)){
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.equal(new Set(q.choices).size,3);assert.ok(q.choices.every(c=>/^\d+$/.test(c)&&Number(c)<=99));
  if(z.id==='calculate'){
   const [a,op,b]=q.text.split(' ');assert.equal(Number(q.choices[q.answer]),op==='+'?Number(a)+Number(b):Number(a)-Number(b));
  }
  if(q.visual?.kind==='seeds')assert.equal(Number(q.choices[q.answer]),q.visual.count);
  if(q.visual?.kind==='tens')assert.equal(Number(q.choices[q.answer]),q.visual.tens*10+q.visual.units);
 }
 assert.equal(ids.size,72);
});
test('multiple days unlock tiers; repeated clicks and help never manufacture mastery',()=>{
 const p=fresh().profiles[0],cards=miniCards('collections',1);
 for(let i=0;i<8;i++)answer(p,cards[0],'correct','2026-10-25','Maths');
 assert.equal(miniTier(p,'collections','2026-10-25'),1);
 answer(p,cards[1],'help','2026-10-26','Maths');answer(p,cards[1],'correct','2026-10-26','Maths');
 assert.equal(miniTier(p,'collections','2026-10-26'),1);
 answer(p,cards[2],'correct','2026-10-27','Maths');answer(p,cards[3],'correct','2026-10-28','Maths');
 assert.equal(miniTier(p,'collections','2026-10-28'),2);
 const second=miniCards('collections',2);
 for(const [i,day] of ['2026-10-29','2026-10-30','2026-10-31','2026-11-01'].entries())answer(p,second[i],'correct',day,'Maths');
 assert.equal(miniTier(p,'collections','2026-11-01'),3);
 assert.equal(miniTier(p,'compare','2026-11-01'),1);
 assert.equal(miniTier(p,'collections','2026-10-25'),1);
});
test('three-card sessions prioritize due retries and preserve both profiles on reload',()=>{
 const state=fresh(),[p1,p2]=state.profiles;
 p1.assignments=[{id:'existing-school'}];p2.history=[{id:'legacy-result',result:'correct'}];p2.records={legacy:{due:'2026-11-01',attempts:7}};
 const p2Before=structuredClone(p2),assignmentBefore=structuredClone(p1.assignments);
 const q=miniCards('compare',1)[2];answer(p1,q,'incorrect','2026-10-25','Maths');
 const historyBefore=structuredClone(p1.history);
 const items=miniSession(p1,'compare','2026-10-25');assert.equal(items.length,3);assert.equal(items[0].id,q.id);
 miniGarden(p1,'2026-10-25');assert.deepEqual(p1.history,historyBefore);
 const storage={value:null,setItem(k,v){this.value=v;},getItem(){return this.value;}};save(storage,state);const restored=load(storage);
 assert.deepEqual(restored.profiles[1],p2Before);assert.deepEqual(restored.profiles[0].assignments,assignmentBefore);assert.deepEqual(restored.profiles[0].history,historyBefore);
 assert.deepEqual(miniSession(p2,'compare','2026-10-25'),[]);assert.equal(miniGarden(p2,'2026-10-25'),'');
 assert.match(worldHome(p1),/data-action="mini-garden"/);assert.doesNotMatch(worldHome(p2),/data-action="mini-garden"/);
});
test('Maths cannot upgrade reading; external resources are links with no local credit',()=>{
 const p=fresh().profiles[0];
 for(const day of ['2026-10-25','2026-10-26'])for(const q of miniCards('tens',1).slice(0,2))answer(p,q,'correct',day,'Français');
 assert.equal(miniTier(p,'tens','2026-10-26'),1);
 assert.match(miniGarden(p,'2026-10-26'),/385_M1_T1_S1_nombres-paires_AR/);
 assert.equal(miniSession(p,'invalid','2026-10-26').length,0);
 assert.equal((miniVisual(miniCards('collections',1)[0]).match(/class="filled"/g)||[]).length,0);
});
test('every card has an accurate illustration, including zero and removed objects',()=>{
 for(const zone of miniZones)for(const tier of [1,2,3])for(const q of miniCards(zone.id,tier)){
  const html=miniVisual(q),v=q.visual;
  assert.ok(html.length>0, q.id);
  const seeds=(html.match(/data-object="seed"/g)||[]).length;
  const nuts=(html.match(/data-object="nut"/g)||[]).length;
  if(v.kind==='seeds'){
   assert.equal(seeds,v.count);assert.equal((html.match(/mini-cell empty/g)||[]).length,20-v.count);
   assert.doesNotMatch(html,/[●·]/);
  }
  if(v.kind==='tens')assert.equal(seeds,v.tens*10+v.units);
  if(v.kind==='compare')assert.equal(seeds,v.numbers.reduce((a,b)=>a+b,0));
  if(v.kind==='sequence')assert.match(html,/mini-missing">\?/);
  if(v.kind==='calculation'){
   const removed=(html.match(/data-removed="true"/g)||[]).length;
   assert.equal(nuts,v.subtract?v.a:v.a+v.b);
   assert.equal(removed,v.subtract?v.b:0);
   assert.equal(nuts-removed,Number(q.choices[q.answer]));
  }
 }
});
