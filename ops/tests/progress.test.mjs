import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,answer,save,load,level} from '../../src/engine.js';
import {learningReport,prioritySkills,adaptiveCards,progressPanel,dailyEvidence,normalizeReadingSubject,isReadingEvent} from '../../src/progress.js';
const day='2026-10-21',card={id:'a',skill:'mots',level:1};
test('memory persists and the two learners never share results',()=>{const s=fresh();answer(s.profiles[0],card,'help',day);let data;const storage={setItem(k,v){data=v;},getItem(){return data;}};save(storage,s);const restored=load(storage);assert.equal(learningReport(restored.profiles[0],day).current.help,1);assert.equal(learningReport(restored.profiles[1],day).total,0);});
test('maths success cannot increase the reading difficulty',()=>{const p=fresh().profiles[0];for(let i=0;i<4;i++)answer(p,{...card,id:'math'+i},'correct',day,'Maths');assert.equal(level(p,'mots'),1);assert.equal(learningReport(p,day).domains[0].subject,'Maths');});
test('repeated same-day successes are not long-term consolidation',()=>{const p=fresh().profiles[0];for(let i=0;i<20;i++)answer(p,card,'correct',day);assert.equal(learningReport(p,day).domains[0].status,'À découvrir');answer(p,{...card,id:'b'},'correct','2026-10-22');answer(p,card,'correct','2026-10-23');assert.equal(learningReport(p,'2026-10-23').domains[0].status,'À consolider dans le temps');});
test('help drives the next priority and explicit subjects retain all cards',()=>{const p=fresh().profiles[0];answer(p,card,'help',day);assert.equal(prioritySkills(p,day)[0],'mots');const cards=[{...card,id:'new'},card];assert.deepEqual(adaptiveCards(p,cards,day).map(q=>q.id),['a','new']);assert.equal(cards[0].id,'new');});
test('weekly windows and legacy history remain honest',()=>{const p=fresh().profiles[0];p.history.push({id:'old',skill:'mots',result:'correct',day:'2026-10-14'});answer(p,card,'help',day);const r=learningReport(p,day);assert.equal(r.previous.independent,1);assert.equal(r.current.help,1);assert.equal(r.legacy,1);assert.ok(progressPanel(p,day).includes('Historique non classé'));assert.equal(p.history.length,2);});
test('the weekly and domain reports keep support visible after a successful retry, including old history',()=>{
 for(const initial of ['help','incorrect']){
  const p=fresh().profiles[0];
  p.history=[{...card,day,result:initial,subject:'Français'},...Array.from({length:4},()=>({...card,day,result:'correct',subject:'Français'}))];
  const original=structuredClone(p.history),r=learningReport(p,day);
  assert.equal(r.current.attempts,5);assert.equal(r.current.observations,1);
  assert.equal(r.current.independent,0);assert.equal(r.current.help,1);
  assert.equal(r.domains[0].independent,0);assert.equal(r.domains[0].help,1);
  assert.deepEqual(p.history,original);
 }
 const p=fresh().profiles[0];for(let i=0;i<20;i++)answer(p,card,'correct',day);
 assert.equal(learningReport(p,day).current.independent,1);
 assert.equal(learningReport(p,day).current.attempts,20);
});
test('old subject skill keys join French without mixing Maths or changing stored history',()=>{
 const p=fresh().profiles[0];
 p.history=[{...card,day,result:'help',subject:'mots'},{...card,day,result:'correct',subject:'Français'},{...card,day,result:'correct',subject:'Maths'}];
 const before=structuredClone(p.history),r=learningReport(p,day);
 assert.equal(r.domains.length,2);
 assert.equal(r.domains.find(d=>d.subject==='Français').help,1);
 assert.equal(r.domains.find(d=>d.subject==='Maths').independent,1);
 assert.equal(prioritySkills(p,day)[0],'mots');assert.equal(level(p,'mots'),1);
 assert.equal(normalizeReadingSubject('syllabes'),'Français');assert.equal(normalizeReadingSubject('Maths'),'Maths');
 assert.equal(isReadingEvent({subject:'sons'}),true);assert.equal(isReadingEvent({subject:'Maths'}),false);
 assert.deepEqual(p.history,before);
 answer(p,{...card,id:'new'},'correct',day,'sons');assert.equal(p.history.at(-1).subject,'Français');
});
test('reading a card in two reading views on one day is still one observation',()=>{
 const events=[{...card,day,result:'help',subject:'Français'},{...card,day,result:'correct',subject:'Lecture'}];
 const e=dailyEvidence(events);assert.equal(e.length,1);assert.equal(e[0].result,'help');
 const p=fresh().profiles[0];p.history=events;
 assert.equal(learningReport(p,day).current.help,1);assert.equal(learningReport(p,day).current.independent,0);
 assert.ok(learningReport(p,day).domains.every(d=>d.independent===0));
 assert.equal(answer(p,card,'correct',day,'Lecture'),'help');assert.equal(p.records.a.streak,0);
});
test('an uncorrected error after a success remains a review need, and the next day can be independent',()=>{
 const p=fresh().profiles[0];answer(p,card,'correct',day);answer(p,card,'incorrect',day);
 assert.equal(learningReport(p,day).current.retry,1);assert.equal(learningReport(p,day).current.independent,0);
 answer(p,card,'correct','2026-10-22');const r=learningReport(p,'2026-10-22');
 assert.equal(r.current.retry,1);assert.equal(r.current.independent,1);assert.equal(r.current.observations,2);
});
