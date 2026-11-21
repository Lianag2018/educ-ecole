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
