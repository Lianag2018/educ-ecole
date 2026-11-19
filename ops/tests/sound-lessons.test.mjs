import test from 'node:test';import assert from 'node:assert/strict';
import {soundStories,soundStoryMarkup,lastStep} from '../../src/sound-stories.js';
import {gestures,lessonWords,wordsFor,gestureFor,LESSON_STEPS} from '../../src/sound-lessons.js';
import {loversCards,loverSyllables} from '../../src/sound-games.js';
test('chaque son a un geste, un bruit et quatre mots découpés en syllabes',()=>{
 for(const s of soundStories){assert.ok(gestures[s.id],'geste manquant '+s.id);assert.match(gestures[s.id][1],/«/);assert.equal(wordsFor(s.id).length,4,'4 mots pour '+s.id);}
});
test('les étapes de leçon (geste, mots) s\'ajoutent avant la fin de l\'histoire',()=>{
 const s=soundStories[0],n=s.pages.length;assert.equal(lastStep(s),n+1+LESSON_STEPS);
 assert.match(soundStoryMarkup(s,{step:n+1}),/data-story-gesture/);assert.match(soundStoryMarkup(s,{step:n+2}),/data-lesson-word/);assert.match(soundStoryMarkup(s,{step:lastStep(s)}),/data-story-play/);
});
test('les cartes des amoureux ont une seule bonne réponse parmi 3 choix',()=>{
 assert.ok(loverSyllables.length>=30);
 for(let n=0;n<8;n++)for(const c of loversCards(n)){assert.equal(c.choices.length,3);assert.equal(new Set(c.choices).size,3,c.prompt);assert.ok(c.answer>=0&&c.answer<3);}
});
test('le texte du livre n\'est pas recopié : pas de page citée',()=>{
 const all=JSON.stringify([gestures,lessonWords]);assert.doesNotMatch(all,/Raconte-moi|Laplante|Atouts/i);
});
