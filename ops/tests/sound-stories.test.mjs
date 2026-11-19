import test from 'node:test';import assert from 'node:assert/strict';
import {soundStories,storyFor,highlight,activityCards,soundStoryMarkup,lastStep,soundStoryNarrationTexts} from '../../src/sound-stories.js';
import {gardenSounds} from '../../src/sound-garden.js';
import {narrationCatalog,STORY_INSTRUCTIONS} from '../../ops/narration-catalog.mjs';
test('chaque histoire est liée à un son du jardin et ses mots colorés sont dans la page',()=>{
 assert.ok(soundStories.length>=3);
 for(const s of soundStories){
  assert.ok(gardenSounds.some(g=>g.id===s.sound),s.id);assert.ok(s.pages.length>=4);
  for(const p of s.pages){const words=p.text.toLowerCase().split(/[^\p{L}]+/u);for(const w of p.words)assert.ok(words.includes(w.toLowerCase()),`${s.id} : « ${w} » absent de « ${p.text} »`);}
 }
});
test('la mise en couleur échappe le HTML et ne colore que les mots listés',()=>{
 assert.equal(highlight('Le <b>loup</b> & le chou',['loup','chou']),'Le &lt;b&gt;<mark class="ss-sound">loup</mark>&lt;/b&gt; &amp; le <mark class="ss-sound">chou</mark>');
 assert.equal(highlight('Loulou, tout doux',['loulou','DOUX']),'<mark class="ss-sound">Loulou</mark>, tout <mark class="ss-sound">doux</mark>');
});
test('les activités sont valides et la réponse n\'est pas écrite telle quelle dans le texte de la carte',()=>{
 const ids=new Set();
 for(const s of soundStories)for(const c of activityCards(s)){
  assert.ok(!ids.has(c.id));ids.add(c.id);assert.ok(c.choices.length>=3&&new Set(c.choices).size===c.choices.length,c.id);
  assert.ok(c.choices[c.answer],c.id);assert.notEqual(c.text.trim().toLowerCase(),c.choices[c.answer].toLowerCase(),c.id);
 }
 assert.ok(new Set(soundStories.flatMap(s=>activityCards(s).map(c=>c.answer))).size>1);
});
test('couverture, pages et fin affichent les bons boutons',()=>{
 const s=storyFor('ou');
 assert.match(soundStoryMarkup(s,{step:0}),/data-story-start/);
 const page=soundStoryMarkup(s,{step:1});assert.match(page,/data-story-listen/);assert.match(page,/ss-sound/);assert.match(page,/Loulou/);
 assert.match(soundStoryMarkup(s,{step:lastStep(s)}),/data-story-play/);
});
test('toutes les pages des histoires sont dans le catalogue de narration avec la voix de narratrice',()=>{
 const catalog=narrationCatalog(),byText=new Map(catalog.map(x=>[x.text,x]));
 for(const t of soundStoryNarrationTexts){const e=byText.get(t);assert.ok(e,t);assert.equal(e.instructions,STORY_INSTRUCTIONS);assert.equal(e.speed,.92);}
});
