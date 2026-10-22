import test from 'node:test';
import assert from 'node:assert/strict';
import {LIBRARY_ITEMS} from '../../src/family-library-data.js';
import {pathsFor, pathProgress, setPathStart, recordPathStep} from '../../src/family-library-paths.js';
import {libraryItemsFor} from '../../src/family-library.js';
import {fresh, load, save, KEY} from '../../src/engine.js';

test('reviewed paths cover every active child document with bounded, profile-correct pages', () => {
  assert.equal(LIBRARY_ITEMS.length, 78);
  assert.equal(LIBRARY_ITEMS.reduce((total, item) => total + item.pages, 0), 426);
  assert.equal(new Set(LIBRARY_ITEMS.map(item => item.id)).size, 78);
  assert.equal(new Set(LIBRARY_ITEMS.map(item => item.archivePathSha256)).size, 78);
  for (const item of LIBRARY_ITEMS) {
    assert.match(item.archivePathSha256, /^[a-f0-9]{64}$/);
    assert.equal(Object.hasOwn(item, 'path'), false);
    for (const guidance of [item.guidance, ...Object.values(item.guidanceByProfile || {})]) {
      assert.ok(guidance.objective);
      for (const page of [...guidance.childPages, ...guidance.parentPages]) assert.ok(Number.isInteger(page) && page >= 1 && page <= item.pages);
    }
  }
  for (const [id, expectedActive, expectedSteps] of [['p1', 26, [8,8,7]], ['p2', 36, [9,9,8]]]) {
    const profile = {id}, paths = pathsFor(profile), available = new Map(libraryItemsFor(profile).map(item => [item.id,item]));
    const seen = new Set(), stepIds = new Set();
    assert.deepEqual(paths.map(path => path.steps.length), expectedSteps);
    for (const path of paths) for (const step of path.steps) {
      assert.ok(!stepIds.has(step.id)); stepIds.add(step.id);
      for (const field of ['title', 'goal', 'instruction', 'readyWhen']) assert.ok(step[field]?.trim());
      assert.ok(step.documents.filter(reference => reference.role !== 'parent').length <= 2);
      for (const reference of step.documents) {
        const item = available.get(reference.id);
        assert.ok(item, `${id}: document belongs to another profile: ${reference.id}`);
        assert.equal(item.later, false, `${reference.id}: deferred document in a path`);
        assert.ok(reference.pages.length > 0);
        assert.ok(['activity', 'material', 'parent'].includes(reference.role));
        for (const page of reference.pages) {
          assert.ok(Number.isInteger(page) && page >= 1 && page <= item.pages);
          if (reference.role !== 'parent') assert.ok(item.guidance.childPages.includes(page), `${step.id}: page ${page} is not a child page`);
        }
        seen.add(item.id);
      }
    }
    const active = LIBRARY_ITEMS.filter(item => item.profile === id && !item.later);
    assert.equal(active.length, expectedActive);
    assert.ok(active.every(item => seen.has(item.id)));
  }
});

test('opening a path is read-only; only an explicit ready result advances the activity', () => {
  const profile = fresh().profiles[0], path = pathsFor(profile)[0], before = JSON.stringify(profile);
  assert.equal(pathProgress(profile,path.id).step.id,path.steps[0].id);
  assert.equal(JSON.stringify(profile),before);
  for (const status of ['again','with-help']) {
    assert.equal(recordPathStep(profile,path.id,path.steps[0].id,status),true);
    assert.equal(pathProgress(profile,path.id).index,0);
    assert.equal(pathProgress(profile,path.id).completedCount,0);
  }
  assert.equal(recordPathStep(profile,path.id,path.steps[0].id,'ready'),true);
  assert.equal(pathProgress(profile,path.id).step.id,path.steps[1].id);
  assert.equal(pathProgress(profile,path.id).completedCount,1);
  assert.deepEqual(profile.history,[]);
  assert.deepEqual(profile.records,{});
  assert.equal(profile.calibrated,false);
});

test('starting later does not mark skipped work ready or erase earlier observations', () => {
  const profile = fresh().profiles[0], path = pathsFor(profile)[0];
  recordPathStep(profile,path.id,path.steps[0].id,'with-help');
  setPathStart(profile,path.id,path.steps[3].id);
  const progress = pathProgress(profile,path.id);
  assert.equal(progress.index,3);
  assert.equal(progress.completedCount,0);
  assert.deepEqual(progress.statuses,{[path.steps[0].id]:'with-help'});
  setPathStart(profile,path.id,path.steps[0].id);
  assert.equal(pathProgress(profile,path.id).index,0);
  assert.equal(pathProgress(profile,path.id).statuses[path.steps[0].id],'with-help');
});

test('a finished path can reopen a completed step without clearing its previous results', () => {
  const profile = fresh().profiles[1], path = pathsFor(profile)[0];
  for (const step of path.steps) recordPathStep(profile,path.id,step.id,'ready');
  assert.equal(pathProgress(profile,path.id).allReady,true);
  setPathStart(profile,path.id,path.steps[0].id);
  let progress = pathProgress(profile,path.id);
  assert.equal(progress.allReady,false);
  assert.equal(progress.step.id,path.steps[0].id);
  assert.equal(progress.completedCount,path.steps.length);
  const restored = JSON.parse(JSON.stringify(profile));
  assert.equal(pathProgress(restored,path.id).step.id,path.steps[0].id);
  recordPathStep(restored,path.id,path.steps[0].id,'with-help');
  assert.equal(pathProgress(restored,path.id).index,0);
  assert.equal(pathProgress(restored,path.id).completedCount,path.steps.length-1);
  recordPathStep(restored,path.id,path.steps[0].id,'ready');
  assert.equal(pathProgress(restored,path.id).allReady,true);
});

test('saved library progress stays isolated by child and preserves existing learning records', () => {
  const state = fresh(), [young,older] = state.profiles;
  const path = pathsFor(young).find(path=>path.id==='numbers');
  young.history.push({id:'existing',skill:'mots',result:'correct',day:'2026-10-22'});
  young.records.existing={attempts:1,streak:1,result:'correct',due:'2026-10-23'};
  young.assignments.push({id:'school-custom',text:'Un mot de classe'});
  const originalRecords=JSON.stringify(young.records),originalHistory=JSON.stringify(young.history),originalAssignments=JSON.stringify(young.assignments);
  recordPathStep(young,path.id,path.steps[0].id,'ready');
  setPathStart(young,path.id,path.steps[2].id);
  const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  assert.equal(save(storage,state),true);assert.ok(values.has(KEY));
  const restored=load(storage);
  assert.equal(pathProgress(restored.profiles[0],path.id).index,2);
  assert.equal(pathProgress(restored.profiles[0],path.id).completedCount,1);
  assert.equal(pathProgress(restored.profiles[1],path.id).index,0);
  assert.equal(restored.profiles[1].familyLibraryProgress,undefined);
  assert.equal(JSON.stringify(restored.profiles[0].records),originalRecords);
  assert.equal(JSON.stringify(restored.profiles[0].history),originalHistory);
  assert.equal(JSON.stringify(restored.profiles[0].assignments),originalAssignments);
  assert.equal(JSON.stringify(older),JSON.stringify(fresh().profiles[1]));
});

test('invalid profiles, paths, steps and statuses cannot create progress', () => {
  const profile=fresh().profiles[0],path=pathsFor(profile)[0],before=JSON.stringify(profile);
  assert.deepEqual(pathsFor({id:'__proto__'}),[]);
  assert.equal(recordPathStep(profile,'not-a-path',path.steps[0].id,'ready'),false);
  assert.equal(recordPathStep(profile,path.id,'not-a-step','ready'),false);
  assert.equal(recordPathStep(profile,path.id,path.steps[0].id,'automatic'),false);
  assert.equal(setPathStart(profile,path.id,'not-a-step'),false);
  assert.equal(JSON.stringify(profile),before);
  profile.familyLibraryProgress={[path.id]:{startStepId:'unknown',reviewStepId:'unknown',results:{[path.steps[0].id]:{status:'automatic'},unknown:{status:'ready'}}}};
  assert.equal(pathProgress(profile,path.id).index,0);
  assert.deepEqual(pathProgress(profile,path.id).statuses,{});
});

test('initial number work and shared answer keys retain the reviewed level boundaries', () => {
  const numbers=pathsFor({id:'p1'}).find(path=>path.id==='numbers');
  assert.ok(numbers.steps.slice(0,5).every(step=>!step.practice));
  const young=libraryItemsFor({id:'p1'}),older=libraryItemsFor({id:'p2'});
  const base=young.find(item=>item.id==='family-72fb37925c99');
  assert.ok(base);
  assert.deepEqual(base.guidance.childPages,[2,3]);
  assert.deepEqual(older.find(item=>item.id===base.id).guidance.childPages,[1,2,3]);
  const answerKeys=LIBRARY_ITEMS.filter(item=>/corrigé/i.test(item.title));
  assert.ok(answerKeys.length);
  assert.ok(answerKeys.every(item=>item.guidance.childPages.length===0&&item.guidance.parentPages.length>0));
  assert.deepEqual(['p1','p2','family'].map(id=>LIBRARY_ITEMS.filter(item=>item.profile===id&&item.later).length),[2,6,1]);
});
