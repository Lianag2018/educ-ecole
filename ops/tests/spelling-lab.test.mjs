import test from 'node:test';import assert from 'node:assert/strict';
import {spellingRules,ruleFor,wordOf,syllableMarkup,wordMarkup,labCards,labHubMarkup,labRuleMarkup,ruleIntroText,trickText,ruleNarrationTexts,allWords} from '../../src/spelling-lab.js';
import {narrationCatalog} from '../../ops/narration-catalog.mjs';
test('cinq mystères d\'orthographe, chacun avec exemples, astuces et activité',()=>{
 assert.ok(spellingRules.length>=5);
 for(const r of spellingRules){assert.ok(r.spellings.length>=3,r.id);assert.equal(r.tricks.length,3,r.id);assert.ok(r.activity.length>=3,r.id);for(const s of r.spellings)assert.ok(s.words.length>=2,r.id+s.g);}
 assert.ok(ruleFor('e-ouvert').question.includes('baigné'));
});
test('chaque mot est décortiqué en syllabes dont la graphie repérée est marquée',()=>{
 for(const r of spellingRules)for(const s of r.spellings)for(const w of s.words){
  assert.ok(w.length>=2&&w.every(x=>x.replace(/[\[\]]/g,'').length>0),wordOf(w));
  assert.ok(w.some(x=>x.includes('[')),wordOf(w)+' : graphie non repérée');
 }
 assert.equal(wordOf(['b[ai]','gné']),'baigné');
 assert.equal(syllableMarkup('b[ai]'),'b<mark class="sl-g">ai</mark>');
 assert.match(wordMarkup(['b[ai]','gné']),/data-lab-word="baigné"/);
 assert.ok(!/<script/.test(syllableMarkup('<script>[x]')));
});
test('activités valides, sans réponse écrite dans le texte de la carte',()=>{
 const ids=new Set();
 for(const r of spellingRules)for(const c of labCards(r)){
  assert.ok(!ids.has(c.id));ids.add(c.id);assert.ok(c.choices.length>=3&&new Set(c.choices).size===c.choices.length,c.id);
  assert.ok(c.choices[c.answer],c.id);
  const words=c.text.toLowerCase().split(/[^\p{L}]+/u);assert.ok(!words.includes(c.choices[c.answer].toLowerCase())&&c.text.toLowerCase()!==c.choices[c.answer].toLowerCase(),c.id+' : réponse écrite dans le texte');
 }
});
test('pages : accueil, observer, astuces, jouer',()=>{
 assert.equal((labHubMarkup().match(/data-lab-rule=/g)||[]).length,spellingRules.length);
 const r=ruleFor('c');
 assert.match(labRuleMarkup(r,0),/data-lab-word/);assert.match(labRuleMarkup(r,0),/data-lab-read/);assert.match(labRuleMarkup(r,1),/Le détective du c/);assert.match(labRuleMarkup(r,1),/data-lab-say/);assert.match(labRuleMarkup(r,2),/data-lab-play/);
 for(const step of [0,1,2])assert.ok(!/Écouter/.test(labRuleMarkup(r,step)),'aucun bouton Écouter');
});
test('tout ce qui est raconté est dans le catalogue de narration',()=>{
 const byText=new Map(narrationCatalog().map(x=>[x.text,x]));
 for(const r of spellingRules){assert.ok(byText.has(ruleIntroText(r)));for(const t of r.tricks)assert.ok(byText.has(trickText(t)));}
 assert.ok(allWords().length>=20);
 assert.equal(ruleNarrationTexts.length,spellingRules.length*4);
});
