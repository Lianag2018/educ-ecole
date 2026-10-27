import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,save,load} from '../../src/engine.js';
import {dailyAdventure,advanceDaily,childHome,subjectHome} from '../../src/child-navigation.js';
import {installPlan} from '../../src/school-plan.js';
import {popitExercise} from '../../src/popit-aid.js';
import {mountParentNavigation} from '../../src/parent-navigation.js';
const day='2026-10-27';
test('daily route survives reload, is isolated by child and never awards success by visiting',()=>{
 const state=fresh(),[a,b]=state.profiles,ra=dailyAdventure(a,day),rb=dailyAdventure(b,day);
 for(const r of [ra,rb]){assert.equal(r.items.length,3);assert.equal(new Set(r.items.map(q=>q.id)).size,3);assert.ok(r.items.some(q=>q.travelSubject==='Maths'));}
 advanceDaily(a,day,0);advanceDaily(a,day,0);assert.equal(ra.index,1);assert.equal(rb.index,0);
 let serialized;const storage={setItem:(k,v)=>serialized=v,getItem:()=>serialized};save(storage,state);
 const restored=load(storage).profiles[0];assert.deepEqual(dailyAdventure(restored,day),ra);
 assert.deepEqual(restored.history,[]);assert.deepEqual(restored.records,{});assert.equal(restored.calibrated,false);
 advanceDaily(restored,day,1);advanceDaily(restored,day,2);advanceDaily(restored,day,3);assert.equal(restored.dailyAdventure.index,3);
 assert.equal(dailyAdventure(restored,'2026-10-28').index,0);
});
test('stale, malformed or foreign daily routes are rebuilt at the actual grade',()=>{
 const [a,b]=fresh().profiles;a.dailyAdventure=dailyAdventure(b,day);
 assert.equal(dailyAdventure(a,day).profileId,'p1');assert.equal(a.dailyAdventure.grade,1);
 a.dailyAdventure.items=[{}];assert.equal(dailyAdventure(a,day).items.length,3);
 a.schoolContext.stage='3e année';assert.equal(dailyAdventure(a,day).grade,3);assert.ok(a.dailyAdventure.items.some(q=>q.travelSubject==='Maths'));
});
test('short daily routes include school words without falsely completing the six-domain calibration',()=>{
 const p=fresh().profiles[0];p.assignments=[{id:'school-local-word',skill:'mots',level:1,text:'chat',prompt:'Lis le mot.',choices:['chat','rat'],answer:0}];
 const route=dailyAdventure(p,day);assert.equal(route.items[0].id,'school-local-word');assert.equal(p.calibrated,false);
 const oral=route.items.find(q=>q.learningMode==='listening');assert.ok(oral);assert.equal(oral.travelSubject,'Compréhension orale');
});
test('daily story moves through chapter cards instead of repeating its first question forever',()=>{
 const p=fresh().profiles[1],q=dailyAdventure(p,day).items.find(x=>x.island);
 p.records[q.id]={result:'correct',due:'2026-10-29'};p.history.push({id:q.id,day,result:'correct',subject:'Français',skill:q.skill});
 const next=dailyAdventure(p,'2026-10-28').items.find(x=>x.island);assert.ok(next);assert.notEqual(next.id,q.id);assert.equal(next.travelSubject,'Maths');
});
test('only the current child and current school week contribute plan questions',()=>{
 const [a,b]=fresh().profiles;
 const plan={profileId:'p2',grade:3,week:'2026-10-26',tasks:[{subject:'Maths',topic:'Tables',instruction:'Addition de 1 à 2',tables:[1,2],operations:['+'],words:[],missing:false}]};
 const {missions}=installPlan(b,plan);assert.equal(dailyAdventure(b,day).items[0].id,missions[0].items[0].id);
 a.schoolPlans=b.schoolPlans;assert.ok(!dailyAdventure(a,day).items.some(q=>missions[0].items.some(m=>m.id===q.id)));
 delete b.dailyAdventure;b.schoolPlans[0].week='2026-10-19';assert.ok(!dailyAdventure(b,day).items.some(q=>missions[0].items.some(m=>m.id===q.id)));
});
test('child home has three primary choices; vocabulary belongs to French, installation to parents',()=>{
 for(const p of fresh().profiles){const home=childHome(p,day);assert.match(home,/data-action="daily-start"/);assert.match(home,/data-action="french"/);assert.match(home,/data-action="maths"/);assert.doesNotMatch(home,/data-popit|data-scene|photos de devoir|App Store/);
 assert.match(subjectHome(p,'maths'),/data-popit/);assert.doesNotMatch(subjectHome(p,'maths'),/Alloprof.*vocabulaire|App Store/);
 assert.doesNotMatch(subjectHome(p,'french'),/App Store|data-popit/);}
});
test('contextual Pop-it follows the actual operands and rejects numbers beyond its axes',()=>{
 for(const [text,target] of [['12 + 12',24],['6 × 4',24],['12 − 5',7],['144 ÷ 12',12]])assert.equal(popitExercise({text}).target,target);
 for(const text of ['27 + 10','0 + 2','13 × 2','11 ÷ 3','144 ÷ 1','2 − 3','la + pin'])assert.equal(popitExercise({text}),null);
 assert.equal(popitExercise({text:'adapted story',beginnerMath:[3,'+',2]}).target,5);
});
test('parent section changes move existing forms without replacing their drafts or selected files',()=>{
 class Node {constructor(dataset={}){this.dataset=dataset;this.children=[];this.attrs={};this.handlers={};}append(n){this.children.push(n);}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}addEventListener(k,f){this.handlers[k]=f;}}
 const old=globalThis.document;globalThis.document={createElement:()=>new Node()};
 try{const host=new Node(),form=new Node({parentGroup:'documents'});form.draft='Mes mots';form.files=['selected-photo'];
 const buttons=['week','documents','progress','settings'].map(x=>new Node({parentSection:x}));
 const root={querySelector:()=>host,querySelectorAll:s=>s==='[data-parent-group]'?[form]:buttons};
 mountParentNavigation(root);assert.equal(host.children.filter(p=>!p.hidden).length,1);
 buttons[1].handlers.click();assert.equal(host.children[1].hidden,false);assert.equal(host.children[1].children[0],form);
 buttons[3].handlers.click();buttons[1].handlers.click();assert.equal(form.draft,'Mes mots');assert.deepEqual(form.files,['selected-photo']);assert.equal(buttons[1].attrs['aria-current'],'page');
 }finally{globalThis.document=old;}
});
