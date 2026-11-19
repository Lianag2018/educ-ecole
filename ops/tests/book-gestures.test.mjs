import test from 'node:test';import assert from 'node:assert/strict';
const mem=new Map();globalThis.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
const {parseGestures,saveBookGestures,bookGestureFor,GRAPHIES_FOR_SOUND}=await import('../../src/book-gestures.js');
const {gestureFor,gestureText,gestures}=await import('../../src/sound-lessons.js');
const {soundStories}=await import('../../src/sound-stories.js');
const SAMPLE='## introduction — Pour joindre\n\nUn long texte qui ne doit pas devenir un geste.\n\n## a — Un gros mal de dents\n\nFeindre d’avoir mal aux dents «aaaa».\n\n## c [s] — En camping (4)\n\nFaire onduler la main «sssss».\n\n## in et im — Le jeu\n\nAppuyer sur un bouton «in».';
test('le fichier de gestes du livre est lu, sans l\'introduction',()=>{
 const m=parseGestures(SAMPLE);assert.deepEqual(Object.keys(m),['a','c [s]','in et im']);assert.match(m.a,/mal aux dents/);assert.equal(m.introduction,undefined);
});
test('chaque son de l\'app peut recevoir le geste du livre, et sans fichier l\'app garde ses propres gestes',()=>{
 mem.clear();for(const s of soundStories)assert.ok(gestures[s.id],'geste de l\'app pour '+s.id);
 assert.equal(bookGestureFor('a'),'');assert.equal(gestureText('a'),gestures.a[1]);
 saveBookGestures(parseGestures(SAMPLE));
 assert.match(gestureText('a'),/mal aux dents/);assert.equal(gestureFor('a')[0],gestures.a[0]);// l'icône reste celle de l'app
 assert.match(gestureText('s'),/onduler la main/);assert.match(gestureText('in'),/bouton/);
 assert.equal(gestureText('ou'),gestures.ou[1]);// pas de geste du livre pour ou dans cet échantillon : on garde le nôtre
 for(const id of Object.keys(GRAPHIES_FOR_SOUND))assert.ok(soundStories.some(s=>s.id===id),'son inconnu '+id);
});
