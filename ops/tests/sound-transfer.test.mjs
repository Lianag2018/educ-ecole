import test from 'node:test';import assert from 'node:assert/strict';
// IndexedDB minimal en mémoire pour tester l'export et l'import.
const store=new Map();
globalThis.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)}};
const ok=(r,v)=>{r.result=v;setTimeout(()=>r.onsuccess?.({target:r}),0);return r;};
globalThis.indexedDB={open(){const q={};setTimeout(()=>{const db={transaction(){const t={};const os={get:k=>ok({},store.get(k)),put:(v,k)=>{store.set(k,v);return {};},delete:k=>{store.delete(k);return {};},getAllKeys:()=>ok({},[...store.keys()])};t.objectStore=()=>os;setTimeout(()=>t.oncomplete?.(),1);return t;},close(){},createObjectStore(){}};q.result=db;q.onupgradeneeded?.();q.onsuccess?.();},0);return q;}};
const {saveRecording,exportSounds,importSounds,listRecorded,getRecording}=await import('../../src/sound-bank.js');
test('un son exporté puis reçu sur une autre tablette est identique',async()=>{
 const bytes=new Uint8Array(900).map((_,i)=>i%251);await saveRecording('ou',bytes.buffer);
 const file=JSON.parse(JSON.stringify(await exportSounds()));assert.equal(file.app,'atelier-mots-sons');assert.deepEqual(Object.keys(file.sounds),['ou']);
 store.clear();assert.deepEqual(await listRecorded(),[]);
 const r=await importSounds(file,['ou','on','ch']);assert.equal(r.saved,1);
 const back=new Uint8Array(await getRecording('ou'));assert.equal(back.length,900);assert.equal(back[250],bytes[250]);
});
test('un fichier qui n’est pas à nous, ou avec un son inconnu, est refusé ou ignoré',async()=>{
 await assert.rejects(()=>importSounds({app:'autre',version:1,sounds:{}},['ou']));await assert.rejects(()=>importSounds(null,['ou']));
 const big='A'.repeat(900),r=await importSounds({app:'atelier-mots-sons',version:1,sounds:{zzz:btoa(big),ou:btoa('x'.repeat(100))}},['ou']);
 assert.equal(r.saved,0);assert.equal(r.skipped,2);
});
const {trimSilence,normalize,peakOf,isEmptyTake}=await import('../../src/sound-stretch.js');
test('un enregistrement très faible (micro d’iPhone) n’est plus coupé en entier',()=>{
 const rate=44100,s=new Float32Array(rate);for(let i=0;i<rate/2;i++)s[rate/4+i]=0.01*Math.sin(i/20); // crête 0,01 : sous l’ancien seuil fixe de 0,02
 const t=trimSilence(s,rate);assert.ok(t.length>rate/3,'le son faible est gardé, pas réduit à un seul échantillon');
 const n=normalize(t);assert.ok(peakOf(n)>0.85,'puis amplifié');assert.equal(isEmptyTake(s,rate),false);
});
test('un enregistrement muet ou trop court est reconnu comme vide',()=>{
 assert.equal(isEmptyTake(new Float32Array(44100),44100),true);
 assert.equal(isEmptyTake(new Float32Array(1000).fill(0.5),44100),true);
 assert.equal(isEmptyTake(new Float32Array(44100).fill(0.2),44100),false);
});
