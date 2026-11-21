import test from 'node:test';import assert from 'node:assert/strict';
const store=new Map();
const ok=(r,v)=>{r.result=v;setTimeout(()=>r.onsuccess?.({target:r}),0);return r;};
globalThis.indexedDB={open(){const q={};setTimeout(()=>{const db={transaction(){const t={};const os={get:k=>ok({},store.get(k)),put:(v,k)=>{store.set(k,v);return {};},clear:()=>{store.clear();return {};}};t.objectStore=()=>os;setTimeout(()=>t.oncomplete?.(),2);return t;},close(){},createObjectStore(){}};q.result=db;q.onupgradeneeded?.();q.onsuccess?.();},0);return q;}};
const {getStoryAudio,storyVoicePaused,resetStoryVoice,pageKey}=await import('../../src/story-voice.js');
const mp3=Buffer.concat([Buffer.from('ID3'),Buffer.alloc(2000,9)]).toString('base64');
const good=async()=>new Response(JSON.stringify({audio:mp3,audioType:'audio/mpeg'}),{status:200});
test('une page lue est gardée : la deuxième lecture ne rappelle pas le serveur',async()=>{
 resetStoryVoice();store.clear();let n=0;const f=async(...a)=>{n++;return good(...a);};
 const a=await getStoryAudio('Le petit loup marche.','p2',{fetcher:f});assert.equal(a.cached,false);assert.ok(a.bytes.byteLength>1000);
 const b=await getStoryAudio('Le petit loup marche.','p2',{fetcher:f});assert.equal(b.cached,true);assert.equal(n,1);
 assert.notEqual(await pageKey('A'),await pageKey('B'));assert.equal(await pageKey(' A '),await pageKey('A'));
});
test('si le serveur refuse, on cesse d’insister un moment et on retombe sur la voix de l’appareil',async()=>{
 resetStoryVoice();store.clear();let n=0;const refuse=async()=>{n++;return new Response('{}',{status:503});};
 assert.equal(await getStoryAudio('Une page.','p1',{fetcher:refuse}),null);assert.equal(storyVoicePaused(),true);
 assert.equal(await getStoryAudio('Une autre page.','p1',{fetcher:refuse}),null);assert.equal(n,1,'pas de deuxième tentative pendant la pause');
 resetStoryVoice();assert.equal(storyVoicePaused(),false);
});
test('réponses invalides ou texte hors limites : rien n’est gardé ni envoyé',async()=>{
 resetStoryVoice();store.clear();let n=0;
 assert.equal(await getStoryAudio('x','p1',{fetcher:async()=>{n++;return good();}}),null);assert.equal(await getStoryAudio('x'.repeat(601),'p1',{fetcher:async()=>{n++;return good();}}),null);assert.equal(n,0);
 for(const bad of [new Response(JSON.stringify({audio:'AAAA',audioType:'audio/mpeg'})),new Response(JSON.stringify({audio:mp3,audioType:'text/html'})),new Response('pas du json'),new Response('{}',{status:401})]){resetStoryVoice();assert.equal(await getStoryAudio('Texte valide.','p1',{fetcher:async()=>bad}),null);}
 resetStoryVoice();const neterr=await getStoryAudio('Encore une page.','p1',{fetcher:async()=>{throw new TypeError('réseau');}});assert.equal(neterr,null);assert.equal(storyVoicePaused(),true);resetStoryVoice();
});
