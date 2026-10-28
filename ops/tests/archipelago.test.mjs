import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,save,load,answer} from '../../src/engine.js';
import {archipelagoState,islandRoute,moveExplorer,positionFor,walkToward,landPosition,completeIslandMission,islands,collectCoconuts,coconuts} from '../../src/archipelago-model.js';
import {installPlan} from '../../src/school-plan.js';
const day='2026-10-28';
const plan=(id,word)=>({profileId:id,grade:id==='p1'?1:3,week:'2026-10-26',tasks:[{subject:'Français',topic:'Mes mots',instruction:'Lire les mots',words:[word],tables:[],operations:[],missing:false}]});

test('four island routes and positions persist separately for each child without crediting visits',()=>{
 const state=fresh(),[a,b]=state.profiles;
 for(const p of [a,b])for(const i of islands){const r=islandRoute(p,i.id,day);assert.equal(r.items.length,3);assert.equal(new Set(r.items.map(q=>q.id)).size,3);}
 moveExplorer(a,'cuba',{x:35,y:52});archipelagoState(a).destination='cuba';
 assert.notDeepEqual(positionFor(a),positionFor(b));
 let serialized;const storage={setItem:(k,v)=>serialized=v,getItem:()=>serialized};save(storage,state);
 assert.deepEqual(positionFor(load(storage).profiles[0]),positionFor(a));
 assert.deepEqual(a.history,[]);assert.deepEqual(a.records,{});assert.equal(a.calibrated,false);
});
test('movement advances over time, clamps long frames and stays on the walkable island',()=>{
 const initial={x:50,y:55},target={x:75,y:60},one=walkToward(initial,target,.016);
 assert.ok(one.x>50&&one.x<75);assert.ok(one.y>55&&one.y<60);
 assert.ok(Math.hypot(walkToward(initial,target,100).x-50,walkToward(initial,target,100).y-55)<=1.101);
 let p=initial;for(let i=0;i<200;i++)p=walkToward(p,target,.016);assert.deepEqual(p,target);
 for(const [x,y] of [[-999,-999],[999,999],[Infinity,NaN]]){const v=landPosition(x,y);assert.ok(Math.hypot((v.x-50)/35,(v.y-55)/23)<=1.00001);}
});
test('new photo plan refreshes same-day missions; other child and other weeks stay separate',()=>{
 const [a,b]=fresh().profiles,first=islandRoute(a,'cuba',day);installPlan(a,plan('p1','chat'));
 const second=islandRoute(a,'cuba',day);assert.notEqual(first.revision,second.revision);assert.equal(second.fromPlan,1);assert.ok(second.items.some(q=>q.text==='chat'));
 installPlan(a,plan('p1','arbre'));const third=islandRoute(a,'cuba',day);assert.notEqual(third.revision,second.revision);assert.ok(third.items.some(q=>q.text==='arbre'));
 b.schoolPlans=a.schoolPlans;assert.equal(islandRoute(b,'cuba',day).fromPlan,0);
 assert.equal(islandRoute(a,'cuba','2026-11-04').fromPlan,0);
});
test('mission completion needs a real recorded attempt, preserves help and rejects stale callbacks',()=>{
 const [a,b]=fresh().profiles,r=islandRoute(a,'cuba',day),c={profileId:a.id,island:'cuba',revision:r.revision,slot:0};
 assert.equal(completeIslandMission(a,c,day),false);answer(a,r.items[0],'help',day,r.items[0].travelSubject);
 assert.equal(completeIslandMission(a,c,day),true);assert.equal(completeIslandMission(a,c,day),true);assert.deepEqual(r.explored,[0]);
 assert.equal(a.history.at(-1).result,'help');assert.equal(completeIslandMission(b,c,day),false);
 assert.equal(completeIslandMission(a,{...c,slot:99},day),false);
 installPlan(a,plan('p1','mer'));islandRoute(a,'cuba',day);assert.equal(completeIslandMission(a,c,day),false);
});
test('coconut pickups require proximity, persist per child/island and never change learning history',()=>{
 const [a,b]=fresh().profiles;assert.deepEqual(collectCoconuts(a,'cuba',{x:50,y:55}),[]);
 assert.deepEqual(collectCoconuts(a,'cuba',coconuts[0]),[0]);assert.deepEqual(collectCoconuts(a,'cuba',coconuts[0]),[]);
 assert.deepEqual(collectCoconuts(a,'mexique',coconuts[0]),[0]);assert.equal(archipelagoState(b).baskets.cuba,undefined);
 assert.deepEqual(a.history,[]);assert.deepEqual(a.records,{});
});
