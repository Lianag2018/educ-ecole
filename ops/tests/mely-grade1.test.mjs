import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {motsMely,sujetsMely,exercicesMely,ecranMely} from '../../src/mely-grade1.js';
test('100 mots et 18 parcours séparés',()=>{
 assert.equal(motsMely.length,100);
 assert.equal(sujetsMely.length,18);
 assert.equal(new Set(sujetsMely.map(x=>x.id)).size,18);
 assert.equal(motsMely[0],'la');
 assert.equal(motsMely.at(-1),'beaucoup');
});
test('les 36 cartes sont uniques, complètes et corrigibles',()=>{
 const cards=sujetsMely.flatMap(x=>exercicesMely(x.id));
 assert.equal(cards.length,36);
 assert.equal(new Set(cards.map(x=>x.id)).size,36);
 for(const c of cards){
  assert.ok(c.prompt&&c.text&&c.explanation);
  assert.equal(c.choices.length,3);
  assert.equal(new Set(c.choices).size,3);
  assert.ok(c.answer>=0&&c.answer<3);
 }
});
test('le module ne contient pas de secrets scolaires ni de fac-similés',()=>{
 const screen=ecranMely();
 assert.ok(screen.includes('Mes 100 mots'));
 assert.ok(!/mot de passe\s*:\s*\S+/i.test(screen));
 assert.ok(!screen.includes('<img'));
});
test('le profil avancé ne reçoit pas le raccourci de 1re année',()=>{
 const world=readFileSync(new URL('../../src/worlds.js',import.meta.url),'utf8');
 assert.match(world,/!older\?'<button class="squishy-banner" data-action="mely-grade1"/);
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(app,/if\(a==='mely-grade1'\)\{if\(!advanced\(profile\(\)\)\)/);
});
test('le studio ne sollicite pas le micro avant la question parentale',()=>{
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 const fn=app.slice(app.indexOf('async function record()'),app.indexOf('async function record()')+600);
 assert.match(fn,/if\(!parentAdditionGate\(\)\)/);
 assert.ok(fn.indexOf('parentAdditionGate()')<fn.indexOf('getUserMedia'));
});

import {narrationCatalog} from '../narration-catalog.mjs';
import {oralQuestion} from '../../src/oral-learning.js';
test('each photographed first-grade word and question has a recorded narration target',()=>{
 const catalog=new Set(narrationCatalog().map(c=>c.text));
 for(const word of motsMely)assert.ok(catalog.has(word),'missing audio '+word);
 for(const topic of sujetsMely)for(const q of exercicesMely(topic.id))assert.ok(catalog.has(oralQuestion(q)),'missing spoken question '+q.id);
});

test('Mely page has a sound test and individual listening controls',()=>{
 const screen=ecranMely();
 assert.match(screen,/data-action="test-voice"/);
 assert.equal((screen.match(/data-mely-word=/g)||[]).length,100);
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(app,/data-mely-word/);
 assert.match(app,/view==='mely-grade1'\)\?\x60<aside/);
});
