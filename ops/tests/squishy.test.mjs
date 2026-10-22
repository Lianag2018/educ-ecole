import test from 'node:test';
import assert from 'node:assert/strict';
import {squishyStages,stageOpen,stageProgress,squishyMap} from '../../src/squishy.js';
import {fresh,answer,save,load} from '../../src/engine.js';
import {narrationCatalog} from '../narration-catalog.mjs';
test('three independent paths, rewards persist and remain isolated',()=>{
 const state=fresh(),[young,older]=state.profiles,s=squishyStages[0],next=squishyStages[1];
 assert.equal(stageOpen(young,s),false);assert.equal(squishyMap(young),'');assert.equal(stageOpen(older,s),true);assert.equal(stageOpen(older,next),false);
 assert.equal(stageOpen(older,squishyStages[4]),true);assert.equal(stageOpen(older,squishyStages[8]),true);
 answer(older,s.items[0],'help','2026-10-22',s.domain);assert.equal(stageOpen(older,next),false);
 answer(older,s.items[1],'incorrect','2026-10-22',s.domain);assert.equal(stageOpen(older,next),true);assert.equal(stageProgress(older,s).independent,0);
 answer(older,s.items[0],'correct','2026-10-22',s.domain);assert.equal(stageProgress(older,s).independent,0);
 answer(older,s.items[0],'correct','2026-10-23',s.domain);assert.equal(stageProgress(older,s).independent,1);assert.equal(stageProgress(young,s).explored,false);
 let data;const storage={setItem(k,v){data=v},getItem(){return data}};save(storage,state);assert.equal(stageProgress(load(storage).profiles[1],s).explored,true);
 assert.equal(squishyStages.filter(x=>stageProgress(older,x).explored).length,1);
});
test('original questions have distinct IDs, valid choices, explanations and recorded-text coverage',()=>{
 const items=squishyStages.flatMap(s=>s.items),texts=new Set(narrationCatalog().map(x=>x.text));
 assert.equal(items.length,24);assert.equal(new Set(items.map(x=>x.id)).size,24);
 for(const q of items){assert.equal(new Set(q.choices).size,2);assert.ok(q.choices[q.answer]);assert.ok(q.explanation.length>20);assert.ok(texts.has(q.text));assert.ok(texts.has(q.hint));}
});
