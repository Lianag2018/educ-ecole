import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,load,save} from '../../src/engine.js';
import {accessValues,schoolAccessBar,schoolAccessSettings,updateSchoolAccess} from '../../src/school-access.js';
import {vocabularyURL} from '../../src/school-vocabulary.js';

test('codes remain isolated per child, without changing progress, and survive reload',()=>{
 const state=fresh();state.profiles[0].history.push({id:'keep'});state.profiles[1].assignments.push({id:'keep-word'});
 let stored;const storage={getItem:()=>stored,setItem:(_,value)=>{stored=value;}};
 const persist=next=>save(storage,next),older=structuredClone(state.profiles[1]),youngRef=state.profiles[0],olderRef=state.profiles[1];
 assert.equal(updateSchoolAccess(state,'p1','nougat',{group:'GROUPE7',username:'eleve-test'},persist),'saved');
 assert.deepEqual(state.profiles[1],older);
 assert.equal(updateSchoolAccess(state,'p2','voca',{code:'TEST123'},persist),'saved');
 assert.equal(state.profiles[0],youngRef);assert.equal(state.profiles[1],olderRef);
 const restored=load(storage);
 assert.equal(restored.profiles[0].history[0].id,'keep');
 assert.equal(restored.profiles[1].assignments[0].id,'keep-word');
 assert.match(schoolAccessBar(restored.profiles[0]),/GROUPE7/);
 assert.doesNotMatch(schoolAccessBar(restored.profiles[0]),/TEST123|MaZone/);
 assert.match(schoolAccessBar(restored.profiles[1]),/TEST123/);
 assert.doesNotMatch(schoolAccessBar(restored.profiles[1]),/GROUPE7|eleve-test/);
 assert.match(vocabularyURL(restored.profiles[1]),/senarioId=TEST123/);
});
test('existing activated Voca list is displayed without migration or duplication',()=>{
 const p=fresh().profiles[1];p.schoolVocabulary={code:'OLD123'};
 assert.equal(accessValues(p,'voca').code,'OLD123');
 assert.match(schoolAccessBar(p),/data-access-copy="voca"/);
 assert.match(schoolAccessSettings([p]),/value="OLD123"/);
});
test('missing values are honest, without fake codes or password inputs',()=>{
 const s=fresh(),markup=s.profiles.map(schoolAccessBar).join('');
 assert.match(markup,/À compléter/);
 assert.match(markup,/Mes accès · Mely-Ann/);assert.match(markup,/Mes accès · Liana/);
 assert.doesNotMatch(markup,/data-access-copy=/);
 const forms=schoolAccessSettings(s.profiles);
 assert.doesNotMatch(forms,/name="password"|type="password"/);
 assert.match(forms,/ne sont pas encore synchronisés/);
});
test('failed storage preserves the old code and all data',()=>{
 for(const persist of [()=>false,()=>{throw Error('quota');}]){
  const s=fresh();s.profiles[1].schoolVocabulary={code:'OLD123'};const before=structuredClone(s);
  assert.equal(updateSchoolAccess(s,'p2','voca',{code:'NEW123'},persist),'storage-unavailable');
  assert.deepEqual(s,before);
 }
});
test('invalid destinations, password properties and bad inputs are rejected before save',()=>{
 const s=fresh(),before=structuredClone(s);let saves=0;const persist=()=>{saves++;return true;};
 for(const [p,r,values] of [['p1','voca',{code:'TEST123'}],['p2','nougat',{group:'TEST',username:'name'}],['p2','unknown',{}],['p2','cec',{username:'name',password:'never-store'}],['p2','voca',{code:'bad&url=evil'}],['p2','cec',{username:'x'.repeat(81)}],['p2','cec',[]]]){
  assert.equal(updateSchoolAccess(s,p,r,values,persist),'invalid');
 }
 assert.equal(saves,0);assert.deepEqual(s,before);
});
test('stored names are escaped and cannot change school destinations',()=>{
 const p=fresh().profiles[0];p.name='<img src=x>';p.schoolAccess={nougat:{username:'<img src=x onerror="bad">',group:'GROUP123',url:'https://evil.example'}};
 const markup=schoolAccessBar(p)+schoolAccessSettings([p]);
 assert.doesNotMatch(markup,/<img|https:\/\/evil/);
 assert.match(markup,/&lt;img/);assert.match(markup,/https:\/\/www\.iplusinteractif\.com/);
});
test('clearing an obsolete list removes its shortcut without erasing other settings',()=>{
 const s=fresh();s.profiles[1].schoolAccess={cec:{username:'cec-test'}};s.profiles[1].schoolVocabulary={code:'OLD123',extra:'keep'};
 assert.equal(updateSchoolAccess(s,'p2','voca',{code:''},()=>true),'saved');
 assert.equal(vocabularyURL(s.profiles[1]),'https://static.alloprof.qc.ca/exercices/exerciseur/voc/');
 assert.equal(s.profiles[1].schoolVocabulary.extra,'keep');assert.equal(s.profiles[1].schoolAccess.cec.username,'cec-test');
});
