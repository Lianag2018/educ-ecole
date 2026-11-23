import test from 'node:test';import assert from 'node:assert/strict';
const mem=new Map(),store={};
globalThis.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
const rec=new Map();
globalThis.indexedDB={open(){const q={};setTimeout(()=>{const db={transaction(){const t={};const os={get:k=>({get result(){return rec.get(k);}}),put:(v,k)=>{rec.set(k,v);return {};},delete:k=>{rec.delete(k);return {};},getAllKeys:()=>({get result(){return [...rec.keys()];}})};t.objectStore=()=>os;setTimeout(()=>t.oncomplete?.(),2);return t;},close(){},createObjectStore(){}};q.result=db;q.onupgradeneeded?.();q.onsuccess?.();},0);return q;}};
// les « get » ci‑dessus renvoient une requête dont result est lu à la fin de la transaction
const ok=(r,v)=>({get result(){return v();}});
const {pullSounds,pushSound,pushDelete,pushAll}=await import('../../src/sound-sync.js');
const bank=await import('../../src/sound-bank.js');
const buf=n=>new Uint8Array(n).fill(7).buffer;
const b64=n=>Buffer.from(new Uint8Array(n).fill(7)).toString('base64');
const server=(over={})=>{const calls=[];const db=over.db||{};const f=async(path,init)=>{const body=JSON.parse(init.body||'{}');calls.push(path.split('/').pop()+':'+(body.id||''));
 if(over.fail)return new Response('{}',{status:over.fail});
 if(path.endsWith('/list'))return new Response(JSON.stringify({sounds:Object.entries(db).map(([id,v])=>({id,updatedAt:v.at})),ms:over.ms||{}}),{status:200});
 if(path.endsWith('/get'))return new Response(JSON.stringify({audio:db[body.id].audio,updatedAt:db[body.id].at}),{status:200});
 if(path.endsWith('/put')){db[body.id]={audio:body.audio,at:'t'+Object.keys(db).length+body.audio.length};return new Response(JSON.stringify({ok:true,updatedAt:db[body.id].at}),{status:200});}
 if(path.endsWith('/delete')){delete db[body.id];return new Response('{"ok":true}',{status:200});}
 return new Response('{"ok":true}',{status:200});};return {f,calls,db};};
test('une tablette reprend les sons de la référence, une seule fois',async()=>{
 rec.clear();const s=server({db:{ou:{audio:b64(2000),at:'v1'}}});
 let r=await pullSounds({fetcher:s.f});assert.equal(r.state,'ok');assert.equal(r.updated,1);assert.equal(rec.get('ou').byteLength,2000);
 r=await pullSounds({fetcher:s.f});assert.equal(r.updated,0);assert.equal(s.calls.filter(c=>c.startsWith('get')).length,1,'pas de nouveau téléchargement');
 s.db.ou={audio:b64(2500),at:'v2'};r=await pullSounds({fetcher:s.f});assert.equal(r.updated,1);assert.equal(rec.get('ou').byteLength,2500);
});
test('un son retiré de la référence est retiré de la tablette; un son jamais synchronisé reste',async()=>{
 rec.clear();const s=server({db:{ou:{audio:b64(2000),at:'v1'}}});await pullSounds({fetcher:s.f});rec.set('a',buf(3000));
 delete s.db.ou;const r=await pullSounds({fetcher:s.f});assert.equal(r.removed,1);assert.equal(rec.has('ou'),false);assert.equal(rec.has('a'),true);
});
test('sans autorisation (401) ou sans réseau : rien ne change',async()=>{
 rec.clear();rec.set('ou',buf(1500));
 assert.equal((await pullSounds({fetcher:server({fail:401}).f})).state,'login');
 assert.equal((await pullSounds({fetcher:async()=>{throw new TypeError('x');}})).state,'network');assert.equal(rec.get('ou').byteLength,1500);
});
test('une modification faite ici et pas encore envoyée n’est jamais écrasée par la référence',async()=>{
 rec.clear();const s=server({db:{i:{audio:b64(2000),at:'v1'}}});await pullSounds({fetcher:s.f});
 rec.set('i',buf(4000));const st=await pushSound('i',buf(4000),{fetcher:server({fail:503}).f});assert.equal(st,'fail');
 s.db.i={audio:b64(2000),at:'v2'};await pullSounds({fetcher:s.f});assert.equal(rec.get('i').byteLength,4000,'local gardé');
 assert.equal(await pushSound('i',buf(4000),{fetcher:s.f}),'ok');
 s.db.i={audio:b64(2100),at:'v3'};const r=await pullSounds({fetcher:s.f});assert.equal(r.updated,1,'une fois envoyé, la référence reprend la main');
});
test('le Mac envoie tout d’un coup, puis ne retélécharge pas ses propres sons',async()=>{
 rec.clear();rec.set('ou',buf(2000));rec.set('on',buf(2200));const s=server();
 const r=await pushAll({fetcher:s.f});assert.equal(r.sent,2);assert.equal(r.state,'ok');assert.deepEqual(Object.keys(s.db).sort(),['on','ou']);
 const p=await pullSounds({fetcher:s.f});assert.equal(p.updated,0);
 assert.equal(await pushDelete('ou',{fetcher:s.f}),'ok');assert.equal(s.db.ou,undefined);
 const bad=await pushAll({fetcher:server({fail:401}).f});assert.equal(bad.state,'login');
});
