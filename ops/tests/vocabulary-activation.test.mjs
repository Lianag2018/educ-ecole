import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,load,save} from '../../src/engine.js';
import {activateVocabulary,vocabularyURL,schoolVocabularyLinks} from '../../src/school-vocabulary.js';
test('private activation persists only the older profile and survives reload',()=>{
 const state=fresh();state.profiles[0].history.push({id:'kept'});state.profiles[1].assignments.push({id:'word-kept'});
 const younger=structuredClone(state.profiles[0]);let stored;
 const storage={getItem:()=>stored,setItem:(_,value)=>{stored=value;}};
 assert.equal(activateVocabulary(state,'#voca=p2:TEST123',next=>save(storage,next)),'ready');
 const restored=load(storage);
 assert.deepEqual(restored.profiles[0],younger);
 assert.equal(restored.profiles[1].assignments[0].id,'word-kept');
 assert.equal(restored.active,'p2');
 assert.equal(vocabularyURL(restored.profiles[1]),'https://static.alloprof.qc.ca/exercices/exerciseur/voc/#/game?senarioId=TEST123&demo=1');
 assert.ok(schoolVocabularyLinks(restored.profiles[1]).includes('Ma liste est prête'));
 assert.ok(!schoolVocabularyLinks(restored.profiles[1]).includes('inscris le code'));
 assert.equal(schoolVocabularyLinks(restored.profiles[0]),'');
});
test('activation rejects injected, foreign profile and malformed fragments without saving',()=>{
 for(const hash of ['#voca=p1:TEST123','#voca=p2:ab','#voca=p2:TEST123&url=https://evil.example','#voca=p2:%22onclick%3Dalert(1)','#voca=p2:TEST123\n']){
  const state=fresh(),before=structuredClone(state);let calls=0;
  assert.equal(activateVocabulary(state,hash,()=>{calls++;return true;}),'invalid');
  assert.equal(calls,0);assert.deepEqual(state,before);
 }
 assert.equal(activateVocabulary(fresh(),'#main',()=>{throw Error('not called');}),null);
});
test('failed storage preserves existing access and all learning data',()=>{
 for(const persist of [()=>false,()=>{throw Error('quota');}]){
  const state=fresh();state.profiles[1].schoolVocabulary={code:'OLD123'};const before=structuredClone(state);
  assert.equal(activateVocabulary(state,'#voca=p2:NEW123',persist),'storage-unavailable');
  assert.deepEqual(state,before);
 }
});
test('tampered stored code cannot change the destination or inject markup',()=>{
 const p=fresh().profiles[1];p.schoolVocabulary={code:'\" onmouseover=\"bad'};
 assert.equal(vocabularyURL(p),'https://static.alloprof.qc.ca/exercices/exerciseur/voc/');
 assert.ok(!schoolVocabularyLinks(p).includes('onmouseover'));
});
