import test from 'node:test';import assert from 'node:assert/strict';
import {journeySteps,journeyNext,markJourney,journeyProgress,stepLabel,journeyDoorMarkup} from '../../src/journey.js';
import {soundStories} from '../../src/sound-stories.js';import {spellingRules} from '../../src/spelling-lab.js';
const mely={id:'p1',schoolContext:{stage:'1re année'}},liana={id:'p2',schoolContext:{stage:'3e année'}};
test('Mely-Ann : les 36 sons une fois chacun, en commençant plus avancé que le « a »',()=>{
 const steps=journeySteps(mely),stories=steps.filter(s=>s.kind==='story');assert.equal(stories.length,soundStories.length);assert.equal(new Set(steps.map(s=>s.id)).size,steps.length);
 assert.ok(steps.every(s=>['story','dict'].includes(s.kind)));assert.equal(steps[0].target,'eacute');assert.equal(steps.filter(s=>s.kind==='dict').length,6);assert.equal(steps[6].id,'dict:0');
});
test('Liana : mystères d\'orthographe mêlés aux histoires, sans doublon',()=>{
 const steps=journeySteps(liana),core=steps.filter(s=>s.kind!=='dict');assert.equal(core.length,soundStories.length+spellingRules.length);assert.equal(new Set(steps.map(s=>s.id)).size,steps.length);assert.ok(steps.filter(s=>s.kind==='dict').length>=10);
 assert.equal(steps[0].id,'lab:e-ouvert');assert.equal(steps.filter(s=>s.kind==='lab').length,spellingRules.length);
});
test('la prochaine étape avance quand l\'étape est terminée, par enfant, puis un nouveau tour recommence',()=>{
 const m={...mely},l={...liana};
 const first=journeyNext(m);assert.equal(first.id,journeyNext(m).id);
 assert.equal(markJourney(m,first.id,'2026-11-19'),true);assert.equal(markJourney(m,first.id,'2026-11-19'),false);
 assert.notEqual(journeyNext(m).id,first.id);assert.equal(journeyNext(l).id,'lab:e-ouvert');
 assert.equal(journeyProgress(m).done,1);assert.equal(stepLabel({kind:'dict',target:'0'}),'Écrire mes mots avec la dictée magique');
 for(const s of journeySteps(m))markJourney(m,s.id,'d');
 const again=journeyNext(m);assert.equal(again.id,journeySteps(m)[0].id);assert.equal(m.journey.laps,1);assert.equal(journeyProgress(m).done,0);
});
test('le bouton affiche l\'étape et reste simple',()=>{
 const html=journeyDoorMarkup({...mely});assert.match(html,/data-action="journey"/);assert.match(html,/Étape 1 sur 42/);assert.match(html,/L’histoire du son « é »/);
 assert.match(journeyDoorMarkup({...liana}),/Mystère : Le son « è »/);
 assert.equal(stepLabel({kind:'story',target:'ch'}),'L’histoire du son « ch »');
});
