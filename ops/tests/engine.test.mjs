import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,load,save,select,answer,generate,level,nextDate,KEY} from '../../src/engine.js';
import {bank,skills} from '../../src/content.js';
import {skillCards} from '../../src/learning.js';
import {learningReport} from '../../src/progress.js';
const day='2026-10-20';
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
test('two independent profiles, records, history and assignments survive persistence',()=>{const s=fresh(),[a,b]=s.profiles,original=structuredClone(b);answer(a,bank[0],'correct',day);a.name='Fleur';a.assignments=generate('bateau neige');a.calibrated=true;s.active='p2';const store=memory();assert.equal(save(store,s),true);const restored=load(store);assert.deepEqual(restored.profiles[1],original);assert.equal(restored.active,'p2');assert.equal(restored.profiles[0].records.sy1.streak,1);assert.equal(restored.profiles[0].name,'Fleur');assert.equal(restored.profiles[0].assignments.length,2);assert.deepEqual(restored,s);});
test('calibration covers every domain without inferring grade',()=>{const p=fresh().profiles[0],items=select(p,day);assert.equal(items.length,6);assert.deepEqual(items.map(q=>q.skill),Object.keys(skills));assert.ok(items.every(q=>q.level===1));assert.equal(p.grade,undefined);});
test('reviews count successful days, with same-day repeats leaving the interval unchanged',()=>{
 for(const result of ['incorrect','help']){
  const p=fresh().profiles[0];let practiceDay=day;
  for(const [i,days] of [1,3,7,14,14].entries()){
   assert.equal(answer(p,bank[0],'correct',practiceDay),'correct');
   const expected=nextDate(practiceDay,days);
   answer(p,bank[0],'correct',practiceDay);
   assert.equal(p.records.sy1.due,expected);assert.equal(p.records.sy1.streak,i+1);
   practiceDay=expected;
  }
  answer(p,bank[0],result,practiceDay);
  assert.equal(p.records.sy1.streak,0);assert.equal(p.records.sy1.due,practiceDay);assert.equal(p.records.sy1.result,result);
  assert.equal(p.history.length,11);assert.equal(p.records.sy1.attempts,11);
 }
});
test('same-day repetitions cannot raise the content tier or turn a retry into independent work',()=>{
 for(const first of ['help','incorrect']){
  const p=fresh().profiles[0];answer(p,bank[0],first,day);
  for(let i=0;i<4;i++)assert.equal(answer(p,bank[0],'correct',day),'help');
  assert.equal(level(p,'syllabes'),1);assert.equal(p.records.sy1.streak,0);assert.equal(p.records.sy1.due,day);
  assert.equal(p.history[0].result,first);assert.equal(p.history.at(-1).submittedResult,'correct');
  assert.equal(p.history.at(-1).result,'help');assert.equal(p.history.length,5);
  assert.equal(answer(p,bank[0],'correct',nextDate(day,1)),'correct');assert.equal(p.records.sy1.streak,1);
 }
 const p=fresh().profiles[0];for(let i=0;i<20;i++)answer(p,bank[0],'correct',day);
 assert.equal(level(p,'syllabes'),1);assert.equal(p.records.sy1.streak,1);assert.equal(p.records.sy1.due,nextDate(day,1));
});
test('tier 2 requires two days and does not strand a grade-3 domain with one introductory card',()=>{
 const p=fresh().profiles[1];p.calibrated=true;const cards=skillCards(p,'syllabes'),q=cards.find(x=>x.level===1);
 assert.equal(cards.filter(x=>x.level===1).length,1);
 for(let i=0;i<4;i++)answer(p,q,'correct',day);
 assert.equal(level(p,'syllabes'),1);
 answer(p,q,'correct',nextDate(day,1));assert.equal(level(p,'syllabes'),2);
 assert.ok(select(p,nextDate(day,1)).some(x=>x.id==='g3-sy2'));
 answer(p,cards.find(x=>x.level===2),'help',nextDate(day,1));assert.equal(level(p,'syllabes'),1);
});
test('authored foundational order is used at entry and for new cards while due reviews remain first',()=>{
 const p=fresh().profiles[0];
 assert.equal(select(p,day).find(q=>q.skill==='sons').id,'first-sound-a');
 assert.equal(select(p,day).find(q=>q.skill==='syllabes').id,'first-blend-la');
 p.calibrated=true;
 for(const id of ['sy1','first-blend-la','so1','first-sound-a'])answer(p,bank.find(q=>q.id===id),'correct',day);
 for(const id of ['first-blend-la','first-sound-a'])answer(p,bank.find(q=>q.id===id),'correct',nextDate(day,1));
 const mission=select(p,nextDate(day,1));
 assert.ok(mission.slice(0,2).every(q=>['sy1','so1'].includes(q.id)));
 assert.equal(mission.find(q=>q.skill==='syllabes'&&q.order!==undefined).id,'first-blend-li');
 assert.equal(mission.find(q=>q.skill==='sons'&&q.order!==undefined).id,'first-sound-i');
 assert.ok(!mission.some(q=>['first-word-domino','first-sound-ch'].includes(q.id)));
});
test('old repeated-click history is preserved but cannot maintain an inflated streak or tier',()=>{
 const p=fresh().profiles[0];
 p.history=Array.from({length:4},()=>({id:'sy1',skill:'syllabes',result:'correct',day}));
 p.records.sy1={streak:4,attempts:4,result:'correct',due:nextDate(day,14)};
 const original=structuredClone(p.history);
 assert.equal(level(p,'syllabes'),1);
 answer(p,bank[0],'correct',day);
 assert.equal(p.records.sy1.streak,1);assert.equal(p.records.sy1.due,nextDate(day,1));
 assert.deepEqual(p.history.slice(0,4),original);assert.equal(p.history.length,5);
});
test('loading old records repairs artificial review delays without rewriting either profile history',()=>{
 const state=fresh(),p=state.profiles[0],other=structuredClone(state.profiles[1]);
 p.name='Profil local';p.assignments=generate('bateau');
 p.history=Array.from({length:4},()=>({id:'sy1',skill:'syllabes',result:'correct',day,subject:'syllabes'}));
 p.history.push({id:'so1',skill:'sons',result:'help',day,subject:'sons'},{id:'so1',skill:'sons',result:'correct',day,subject:'Français'});
 p.records.sy1={streak:4,attempts:4,result:'correct',due:nextDate(day,14)};
 p.records.so1={streak:1,attempts:2,result:'correct',due:nextDate(day,1)};
 const history=structuredClone(p.history),storage=memory();save(storage,state);
 const restored=load(storage),r=restored.profiles[0];
 assert.deepEqual(r.history,history);assert.deepEqual(restored.profiles[1],other);
 assert.equal(r.records.sy1.streak,1);assert.equal(r.records.sy1.due,nextDate(day,1));assert.equal(r.records.sy1.attempts,4);
 assert.equal(r.records.so1.streak,0);assert.equal(r.records.so1.result,'help');assert.equal(r.records.so1.due,day);assert.equal(r.records.so1.attempts,2);
 assert.equal(r.name,p.name);assert.deepEqual(r.assignments,p.assignments);
 save(storage,restored);assert.deepEqual(load(storage),restored);
});
test('damaged historical events do not reset a family or remove unrelated record fields on load',()=>{
 const state=fresh(),[p,other]=state.profiles;
 p.name='Mémoire conservée';other.name='Autre profil conservé';
 answer(p,bank[0],'correct',day);p.records.sy1.parentNote='Conserver';
 p.records.unrelated={custom:'Valeur intacte'};
 p.history.push(null,{},[],{id:'sy1',day,skill:'syllabes',result:'unknown'},
  {id:'sy1',day:'2026-02-30',skill:'syllabes',result:'correct'},
  {id:'sy1',day:'2026-13-01',skill:'syllabes',result:'correct'},
  {id:'sy1',day:'pas une date',skill:'syllabes',result:'correct'},
  {id:'sy1',day:17,skill:'syllabes',result:'correct'},
  {id:'sy1',day,result:'correct'});
 const expected=structuredClone(state),storage=memory();save(storage,state);
 const restored=load(storage);assert.deepEqual(restored,expected);
 assert.equal(level(restored.profiles[0],'syllabes'),1);assert.equal(learningReport(restored.profiles[0],day).current.observations,1);
 restored.profiles[0].calibrated=true;assert.doesNotThrow(()=>select(restored.profiles[0],day));
 assert.equal(answer(restored.profiles[0],bank[0],'correct',day),'correct');
 assert.deepEqual(restored.profiles[0].history.slice(0,-1),expected.profiles[0].history);
 assert.equal(restored.profiles[0].records.sy1.parentNote,'Conserver');
});
test('due reviews prioritized, deterministic selection, at most eight activities',()=>{const p=fresh().profiles[0];p.calibrated=true;answer(p,bank.find(q=>q.id==='co2'),'incorrect','2026-10-19');answer(p,bank.find(q=>q.id==='so2'),'help',day);const a=select(p,day);assert.equal(a[0].id,'co2');assert.equal(a[1].id,'so2');assert.deepEqual(a,select(p,day));assert.ok(a.length<=8);assert.equal(new Set(a.map(q=>q.id)).size,a.length);});
test('school practice is bounded, literal, isolated and selected after assignment',()=>{const s=fresh();const cards=generate('École, école! bateau bateau. <script>alert</script>');assert.equal(cards.filter(q=>q.text==='bateau').length,1);assert.ok(cards.every(q=>q.choices.length===0 && q.answer===null));s.profiles[0].assignments=cards;s.profiles[0].calibrated=true;assert.ok(select(s.profiles[0],day).some(q=>q.id.startsWith('school-')));assert.ok(select(s.profiles[1],day).every(q=>!q.id.startsWith('school-')));assert.ok(generate('mot '.repeat(5000)).length<=20);assert.deepEqual(generate('123 !!!'),[]);});
test('unavailable storage and damaged data fall back without breaking core',()=>{const broken={getItem(){throw Error();},setItem(){throw Error();}};assert.deepEqual(load(broken),fresh());assert.equal(save(broken,fresh()),false);const s=memory();s.setItem(KEY,'bad json');assert.deepEqual(load(s),fresh());s.setItem(KEY,JSON.stringify({version:1,profiles:[]}));assert.deepEqual(load(s),fresh());});
test('content integrity: unique ids, every choice has one answer, authored feedback',()=>{assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);for(const q of bank){assert.ok(skills[q.skill]);assert.ok(q.text.length>0);assert.ok(q.explanation.length>20);assert.ok(Number.isInteger(q.answer));assert.ok(q.choices[q.answer]);assert.equal(new Set(q.choices).size,q.choices.length);}});
test('dates cross month/year boundaries without UTC date shift',()=>{assert.equal(nextDate('2026-12-31',1),'2027-01-01');assert.equal(nextDate('2028-02-28',1),'2028-02-29');});
test('tier 3 needs several days and different cards, and assisted practice lowers it',()=>{
 const p=fresh().profiles[0];p.calibrated=true;
 const q=bank.find(q=>q.id==='co1'),other=bank.find(q=>q.id==='co2');
 for(let i=0;i<4;i++)answer(p,q,'correct',nextDate(day,i));
 assert.equal(level(p,'comprehension'),2);
 answer(p,other,'correct',nextDate(day,3));assert.equal(level(p,'comprehension'),3);
 assert.ok(select(p,nextDate(day,3)).some(q=>q.id==='co4'));
 assert.equal(level(p,'comprehension',day),1);
 answer(p,q,'help',nextDate(day,3));assert.equal(level(p,'comprehension'),2);
 answer(p,other,'incorrect',nextDate(day,3));assert.equal(level(p,'comprehension'),1);
 const sameDay=fresh().profiles[0];
 for(const card of bank.filter(x=>x.skill==='comprehension'))answer(sameDay,card,'correct',day);
 assert.equal(level(sameDay,'comprehension'),1);
});
test('future reviews are never presented early',()=>{const p=fresh().profiles[0];p.calibrated=true;for(const q of bank)answer(p,q,'correct',day);assert.deepEqual(select(p,day),[]);assert.ok(select(p,nextDate(day,1)).length>0);});
