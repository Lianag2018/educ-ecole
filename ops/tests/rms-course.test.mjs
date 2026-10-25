import test from 'node:test';
import assert from 'node:assert/strict';
import {rmsLessons,rmsEnabled,rmsRecord,rmsSuggested,rmsTier,rmsPictures,rmsSpellings} from '../../src/rms-course.js';
import {fresh,save,load} from '../../src/engine.js';
import {gardenSounds} from '../../src/sound-garden.js';
test('all observed printed pages 34–112 are represented exactly once and in order',()=>{
 assert.deepEqual(rmsLessons.flatMap(l=>l.pages),Array.from({length:79},(_,i)=>i+34));
 assert.equal(new Set(rmsLessons.map(l=>l.id)).size,rmsLessons.length);
 for(const l of rmsLessons){assert.ok(!l.sound||gardenSounds.some(s=>s.id===l.sound));assert.ok(l.word&&l.picture&&l.cue);assert.ok(l.parts.every(Boolean));}
});
test('context-sensitive spelling has explicit models and silent h has no false phoneme',()=>{
 const at=n=>rmsLessons.find(l=>l.pages.includes(n));
 assert.equal(at(65).sound,null);assert.match(at(65).cue,/muet/);
 assert.equal(at(76).sound,'s');assert.equal(at(73).sound,'k');assert.equal(at(87).sound,'g');assert.equal(at(88).sound,'j');
 assert.equal(at(101).sound,'oe');assert.equal(at(66).sound,'eu');assert.equal(at(111).sound,'k');assert.equal(at(47).sound,'ch');assert.equal(at(96).sound,'z');
 assert.equal(at(71).word,'empreinte');assert.match(at(81).cue,/dépend du mot/);assert.match(at(102).cue,/ville/);
});
test('picture and spelling choices have one answer with distinct image distractors',()=>{
 for(const l of rmsLessons)for(const tier of [1,2,3]){
  const pics=rmsPictures(l,tier);assert.equal(pics.filter(c=>c.word===l.word).length,1);assert.equal(new Set(pics.map(c=>c.picture)).size,pics.length);assert.equal(pics.length,tier===1?2:3);
  const spells=rmsSpellings(l,tier);assert.equal(spells.filter(s=>s===l.parts.join('')).length,1);assert.ok(spells.length>=2);
 }
});
test('no launch credit, multi-day thresholds, assisted retries, reload, p2 and old data preserved',()=>{
 const state=fresh(),p=state.profiles[0],other=JSON.stringify(state.profiles[1]),l=rmsLessons[0];
 p.records.legacy={attempts:7};p.assignments.push({id:'old'});
 assert.ok(rmsEnabled(p));assert.equal(rmsEnabled(state.profiles[1]),false);assert.equal(rmsSuggested(p,'2026-10-25'),l);assert.equal(p.history.length,0);
 for(let i=0;i<10;i++)rmsRecord(p,l,1,'correct','2026-10-20');assert.equal(rmsTier(p,l,'2026-10-20'),1);
 rmsRecord(p,l,2,'correct','2026-10-21');assert.equal(rmsTier(p,l,'2026-10-21'),2);
 rmsRecord(p,l,2,'help','2026-10-22');assert.equal(rmsRecord(p,l,2,'correct','2026-10-22'),'help');assert.equal(rmsTier(p,l,'2026-10-22'),1);
 for(const day of ['2026-10-23','2026-10-24','2026-10-25','2026-10-26'])rmsRecord(p,l,1,'correct',day);
 assert.equal(rmsTier(p,l,'2026-10-26'),3);
 assert.equal(rmsRecord(state.profiles[1],l,1,'correct','2026-10-25'),null);assert.equal(JSON.stringify(state.profiles[1]),other);
 const store={value:null,setItem(_k,v){this.value=v;},getItem(){return this.value;}};
 p.rmsSession={lessonId:l.id,step:2,help:true};save(store,state);const restored=load(store);
 assert.deepEqual(restored.profiles[0].rmsSession,p.rmsSession);assert.deepEqual(restored.profiles[0].records.legacy,{attempts:7});assert.deepEqual(restored.profiles[0].assignments,p.assignments);assert.equal(restored.profiles[0].history.length,p.history.length);
});
