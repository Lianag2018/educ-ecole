import test from 'node:test';
import assert from 'node:assert/strict';
import {SpeedRound,adaptSpeed,speedCard} from '../../src/speed-math.js';
import {mathSpeech} from '../../src/math-speech.js';
import {fresh} from '../../src/engine.js';
import {installPlan,planMissions,missionOpen,validatePlan} from '../../src/school-plan.js';
import {planEndpoint} from '../server/plans.mjs';
test('numeric model handles signs without English, digit splitting or touching syllables/dates',()=>{
 for(const [input,out] of [['56-20','cinquante-six moins vingt'],['56 − 20','cinquante-six moins vingt'],['20','vingt'],['2','deux'],['56','cinquante-six'],['3 + 7 = 10','trois plus sept égale dix'],['1999','mille neuf cent quatre-vingt-dix-neuf'],['la + pin','la + pin'],['2026-10-22','2026-10-22']])assert.equal(mathSpeech(input),out);
});
test('all generated arithmetic choices have exactly one correct answer and obey levels',()=>{
 for(let l=0;l<3;l++)for(let i=0;i<300;i++){const q=speedCard(l);const [a,op,b]=q.text.split(' ');const expected=op==='+'?Number(a)+Number(b):Number(a)-Number(b);assert.equal(Number(q.choices[q.answer]),expected);assert.equal(new Set(q.choices).size,3);assert.ok(q.choices.every(c=>Number(c)>=0));}
});
test('speed rises only after repeated correct quick answers; mistakes and slowness ease the level',()=>{
 const run=(level,correct,ms)=>{let s={level,block:0,recent:[]};for(let i=0;i<5;i++)s=adaptSpeed(s,{level,block:s.block,correct,ms,help:false});return s;};
 assert.equal(run(0,true,1500).level,1);assert.equal(run(1,false,100).level,0);assert.equal(run(2,true,20000).level,1);
 let s={level:0,block:0,recent:[]};for(let i=0;i<4;i++)s=adaptSpeed(s,{level:0,block:0,correct:true,ms:1});assert.equal(s.level,0);
});
test('pause excludes time and duplicate taps are ignored; clock can exceed target',()=>{
 let now=0;const g=new SpeedRound(fresh().profiles[1],{now:()=>now});g.next();now=1000;g.pause();now=61000;assert.equal(g.time(),1000);assert.equal(g.submit(0),null);g.resume();now=91000;const e=g.submit(g.card.answer);assert.equal(e.ms,31000);assert.ok(e.correct);assert.equal(g.submit(0),null);assert.equal(g.results.length,1);
});
const task={subject:'Maths',topic:'Tables',instruction:'Addition de 1 à 2',tables:[1,2],operations:['+'],words:[],missing:false};
const plan={profileId:'p2',grade:3,week:'2026-10-19',tasks:[task,{...task,topic:'Soustraction',operations:['−']}]};
test('plans isolate profiles, preserve prior weeks, and unlock only after correct attempts',()=>{
 const [a,b]=fresh().profiles;assert.throws(()=>installPlan(a,plan),/profile_mismatch/);const {missions}=installPlan(b,plan);assert.equal(a.schoolPlans,undefined);assert.equal(missionOpen(b,missions,1),false);
 for(const q of missions[0].items.slice(0,4))b.records[q.id]={result:'correct'};assert.ok(missionOpen(b,missions,1));
 installPlan(b,{...plan,week:'2026-10-26'});assert.equal(b.schoolPlans.length,2);const updated=planMissions({...plan,tasks:[{...task,tables:[3]}]}).missions[0];assert.notEqual(updated.items[0].id,missions[0].items[0].id);
});
test('missing words/pages never become invented school questions; invalid dates rejected',()=>{
 const x=planMissions({...plan,tasks:[{...task,missing:true}]});assert.equal(x.missions.length,0);assert.equal(x.unsupported.length,1);assert.throws(()=>validatePlan({...plan,week:'2026-02-30'}));
});
const image='data:image/jpeg;base64,'+Buffer.concat([Buffer.from([255,216,255]),Buffer.alloc(100)]).toString('base64');
function fixture(overrides={}){const calls=[];return {calls,args:{auth:{authenticateParent:async()=>({id:'parent'})},profiles:{ownedBy:async()=>({stage:'3e année'})},ledger:{durable:true,reserve:async()=>calls.push('budget')},store:{find:async()=>null,list:async()=>[],save:async(...a)=>calls.push(['saved',...a])},config:{plansEnabled:true,paidEnabled:true,parentConsent:true,zeroDataRetentionVerified:true,endpointRetentionVerified:true,childDataEligibilityReviewed:true,dedicatedHosting:true,otherCostsMicros:1000000},apiKey:'test',fetcher:async(url,req)=>{calls.push(['provider',JSON.parse(req.body)]);return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({readable:true,...plan})}}]})};},...overrides}};}
const req={method:'POST',path:'/api/plans/import',body:{profileId:'p2',week:plan.week,consent:true,image}};
test('photo pipeline reserves before provider, stores no photo, uses fixed model and no tools',async()=>{const f=fixture();assert.equal((await planEndpoint(f.args)(req)).status,200);assert.equal(f.calls[0],'budget');assert.equal(f.calls[1][1].store,false);assert.equal(f.calls[1][1].tools,undefined);assert.ok(!JSON.stringify(f.calls.at(-1)).includes('data:image'));});
test('missing auth, config, budget and bad images prevent any provider charge',async()=>{
 for(const override of [{auth:{authenticateParent:async()=>null}},{config:{}},{ledger:{durable:true,reserve:async()=>{throw Error();}}}]){const f=fixture(override);assert.notEqual((await planEndpoint(f.args)(req)).status,200);assert.ok(!f.calls.some(x=>x[0]==='provider'));}
 const f=fixture();assert.equal((await planEndpoint(f.args)({...req,body:{...req.body,image:'https://internal/private'}})).status,422);assert.equal(f.calls.length,0);
});
test('same image cache is isolated by owner/slot and avoids another charge',async()=>{let keys;const f=fixture({store:{find:async(...a)=>{keys=a;return plan;}}});const r=await planEndpoint(f.args)(req);assert.equal(r.body.reused,true);assert.deepEqual(keys.slice(0,2),['parent','p2']);assert.equal(f.calls.length,0);});
