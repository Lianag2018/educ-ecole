import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,save,load} from '../../src/engine.js';
import {dailyAdventure,nextDailyAdventure,advanceDaily} from '../../src/child-navigation.js';
import {skillCards,mathsFor,storyCards} from '../../src/learning.js';
const day='2026-10-28';
test('twelve daily rounds have no repeats, survive reload and preserve independent profiles',()=>{
 const state=fresh(),p=state.profiles[0],seen=new Set();
 let data;const storage={setItem:(_,v)=>data=v,getItem:()=>data};
 for(let round=0;round<12;round++){
  const route=dailyAdventure(p,day);assert.equal(route.items.length,3);
  for(const q of route.items){assert.ok(!seen.has(q.id));seen.add(q.id);}
  assert.equal(nextDailyAdventure(p,day),route);
  for(let i=0;i<3;i++)advanceDaily(p,day,i);
  nextDailyAdventure(p,day);save(storage,state);assert.deepEqual(dailyAdventure(load(storage).profiles[0],day),p.dailyAdventure);
 }
 assert.equal(state.profiles[1].dailyAdventure,undefined);assert.deepEqual(p.history,[]);assert.deepEqual(p.records,{});
});
test('banks have distinct IDs, valid varying answers and mathematically correct results',()=>{
 const [a,b]=fresh().profiles;
 for(const p of [a,b]){
  const syllables=skillCards(p,'syllabes'),math=mathsFor(p),stories=storyCards(p);
  assert.ok(syllables.length>=24);assert.ok(math.length>=60);assert.ok(stories.length>=8);
  const all=[...syllables,...math,...stories];assert.equal(new Set(all.map(q=>q.id)).size,all.length);
  for(const q of all){assert.ok(q.answer>=0&&q.answer<q.choices.length);assert.equal(new Set(q.choices).size,q.choices.length);}
  for(const q of math.filter(q=>q.practiceExtension)){const [a,op,b]=q.text.split(' ');const n=op==='+'?+a+(+b):op==='−'?a-b:op==='×'?a*b:a/b;assert.equal(+q.choices[q.answer],n);}
  assert.equal(new Set(math.filter(q=>q.practiceExtension).map(q=>q.answer)).size,3);
 }
 assert.ok(mathsFor(a).every(q=>!mathsFor(b).some(x=>x.id===q.id)));
 a.schoolContext.stage='3e année';assert.deepEqual(skillCards(a,'syllabes'),skillCards(b,'syllabes'));
});
