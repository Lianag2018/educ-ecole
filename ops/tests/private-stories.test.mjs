import test from 'node:test';import assert from 'node:assert/strict';
const mem=new Map();globalThis.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
const {parseStories,savePrivate,loadPrivate,clearPrivate,privateStoriesMarkup}=await import('../../src/private-stories.js');
const {storyFor,soundStoryMarkup,lastStep}=await import('../../src/sound-stories.js');
const SAMPLE='## ez — Titre exemple\n\nPremière page avec *ez* et chez.\n\nDeuxième page sans repère ez.\n\n## ill — Autre\n\nUne bille brille.';
test('un fichier simple devient des histoires, une page par paragraphe',()=>{
 const l=parseStories(SAMPLE);assert.equal(l.length,2);assert.equal(l[0].pages.length,2);assert.deepEqual(l[0].pages[0].words,['ez']);
 assert.deepEqual(l[0].pages[1].words,['ez']);assert.deepEqual(l[1].pages[0].words,['bille','brille']);assert.equal(l[0].pages[0].text.includes('*'),false);
});
test('les histoires importées restent dans l\'appareil et se jouent sans leçon ni activité',()=>{
 clearPrivate();assert.equal(loadPrivate().length,0);const l=savePrivate(parseStories(SAMPLE));assert.equal(l.length,2);
 const s=storyFor(l[0].id);assert.ok(s&&s.private);assert.equal(lastStep(s),s.pages.length+1);
 assert.doesNotMatch(soundStoryMarkup(s,{step:lastStep(s)}),/data-story-play/);assert.match(soundStoryMarkup(s,{step:1}),/data-story-word/);
 assert.match(privateStoriesMarkup(),/data-private-open/);clearPrivate();assert.equal(storyFor(l[0].id),null);
});
test('le code de l\'app ne contient aucune histoire du livre',async()=>{
 const fs=await import('node:fs');const src=fs.readFileSync(new URL('../../src/private-stories.js',import.meta.url),'utf8');assert.doesNotMatch(src,/village des sons|Piquera|bicyclette/i);
});
test('la liste des histoires est paginée (6 par page)',async()=>{
 const {privateStoriesMarkup,psPages,savePrivate,clearPrivate,parseStories}=await import('../../src/private-stories.js');
 clearPrivate();const txt=Array.from({length:14},(_,i)=>`## g${i} — Titre ${i}\n\nUne page ${i}.`).join('\n\n');savePrivate(parseStories(txt));
 assert.equal(psPages(),3);assert.equal((privateStoriesMarkup(0).match(/data-private-open/g)||[]).length,6);assert.equal((privateStoriesMarkup(2).match(/data-private-open/g)||[]).length,2);clearPrivate();
});
test('les outils d\'ajout et d\'effacement ne sont visibles que pour un adulte, et effacer ne bloque pas le rechargement',async()=>{
 const {privateStoriesMarkup,savePrivate,clearPrivate,parseStories}=await import('../../src/private-stories.js');
 savePrivate(parseStories('## a — T\n\nUne page.'));
 assert.doesNotMatch(privateStoriesMarkup(0),/data-private-clear|data-private-file/);assert.match(privateStoriesMarkup(0,{adult:true}),/data-private-clear/);
 localStorage.setItem('atelier-mots-family-content-v1','1:1');clearPrivate();assert.equal(localStorage.getItem('atelier-mots-family-content-v1'),null);
});
