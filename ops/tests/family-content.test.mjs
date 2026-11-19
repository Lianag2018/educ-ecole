import test from 'node:test';import assert from 'node:assert/strict';
const mem=new Map();globalThis.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
const {parseBookWords,saveBookWords,bookWordsFor}=await import('../../src/book-words.js');
const {wordsFor}=await import('../../src/sound-lessons.js');
const {seedFamilyContent}=await import('../../src/family-content.js');
test('les mots du livre s\'ajoutent aux mots du son, avec syllabes, sans doublon',()=>{
 const m=parseBookWords('## ou | ou\nbouton sou-pe zoulou\nfou\n## on | on\nbonbon');
 assert.deepEqual(m.ou,['bouton','sou-pe','zoulou','fou']);assert.deepEqual(m.on,['bonbon']);
 saveBookWords({ou:['zoulou','bouton','tourbillon']});
 const w=wordsFor('ou'),plain=w.map(x=>x.plain);assert.ok(plain.includes('zoulou')&&plain.includes('tourbillon'));assert.equal(new Set(plain).size,plain.length);
 assert.equal(w.find(x=>x.plain==='tourbillon').syllables.join('-'),'tour-bil-lon');
 saveBookWords({});
});
test('sans dossier family, le chargement ne fait rien',async()=>{globalThis.fetch=async()=>({ok:false,text:async()=>'',headers:{get:()=>'text/plain'}});assert.equal(await seedFamilyContent(),false);});
test('un contenu de famille est chargé une seule fois par version',async()=>{
 const files={'/family/histoires-ecole.md':'## ez — T\n\nUne page avec *ez*.','/family/mots-du-livre.md':'## ez | eacute\nnez chez'};
 globalThis.fetch=async u=>({ok:Boolean(files[u]),text:async()=>files[u]||'',headers:{get:()=>'text/markdown'}});
 assert.equal(await seedFamilyContent(),true);assert.deepEqual(bookWordsFor('eacute'),['nez','chez']);assert.equal(await seedFamilyContent(),false);
});
