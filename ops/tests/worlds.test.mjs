import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,select,answer} from '../../src/engine.js';
import {worldHome,worldsFor} from '../../src/worlds.js';
import {schoolVocabularyLinks} from '../../src/school-vocabulary.js';
import {travelHome} from '../../src/voyage.js';
import {skillCards,storyCards,mathsFor,numberRows} from '../../src/learning.js';
test('selected younger world has no sister, 1999 or weekly table controls',()=>{
 const [young,older]=fresh().profiles;
 const first=worldHome(young),second=worldHome(older);
 assert.ok(first.includes('Le jardin des sons'));assert.ok(first.includes('Mes petites histoires'));
 assert.ok(!first.includes('Liana'));assert.ok(!first.includes('1 999'));assert.ok(!first.includes('data-action="weekly"'));assert.ok(!first.includes('data-child'));
 assert.ok(second.includes('Liana'));assert.ok(second.includes('1 999'));assert.ok(second.includes('data-action="weekly"'));assert.ok(!second.includes('Mely-Ann'));assert.ok(!second.includes('Mes petites histoires'));
 assert.equal(worldsFor(young).length,6);assert.equal(worldsFor(older).length,6);
});
test('all launched world banks are isolated even after the older child progresses',()=>{
 const [young,older]=fresh().profiles;
 const ids=p=>new Set([...select(p,'2026-10-22'),...skillCards(p,'sons'),...skillCards(p,'syllabes'),...storyCards(p),...mathsFor(p)].map(x=>x.id));
 const before=ids(young);for(const q of select(older,'2026-10-22'))answer(older,q,'correct','2026-10-22');
 assert.deepEqual(ids(young),before);assert.ok([...ids(older)].every(id=>!before.has(id)));assert.ok(Object.values(numberRows(young)).flat().every(n=>n<100));
});
test('world labels follow school placement and escape custom names',()=>{
 const p=fresh().profiles[0];p.name='<script>bad</script>';assert.ok(!worldHome(p).includes('<script>'));
 p.schoolContext.stage='3e année';assert.ok(worldHome(p).includes('1 999'));assert.ok(worldHome(p).includes('3e année'));
});
test('Alloprof vocabulary belongs only to Liana in both home layouts',()=>{
 const [young,older]=fresh().profiles;
 for(const render of [worldHome,travelHome]){
  assert.ok(render(older).includes('Mes mots · Alloprof'));
  assert.ok(!render(young).includes('Mes mots · Alloprof'));
 }
 young.schoolContext.stage='3e année';
 assert.equal(schoolVocabularyLinks(young),'');
 assert.equal(schoolVocabularyLinks(null),'');
});
test('Alloprof guest links send no profile data and do not change learning records',()=>{
 const older=fresh().profiles[1],before=structuredClone(older);
 older.name='<private-child-name>';
 const markup=schoolVocabularyLinks(older);
 assert.ok(!markup.includes(older.name));
 const links=[...markup.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)];
 assert.equal(links.length,2);
 for(const [tag,href] of links){
  const url=new URL(href);
  assert.ok(['static.alloprof.qc.ca','apps.apple.com'].includes(url.hostname));
  assert.equal(url.protocol,'https:');assert.equal(url.search,'');assert.equal(url.hash,'');
  assert.ok(tag.includes('target="_blank"'));assert.ok(tag.includes('rel="noopener noreferrer"'));
 }
 assert.ok(markup.includes('Continuer sans se connecter'));
 assert.deepEqual(older.history,before.history);
});
