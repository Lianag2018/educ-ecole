import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stagesFor,challengeStepMarkup} from '../../src/challenge-guide.js';
test('different school levels use age-appropriate challenge steps',()=>{
 assert.deepEqual(stagesFor({skill:'syllabes'},1),['Écoute','Assemble','Choisis']);
 assert.deepEqual(stagesFor({skill:'syllabes'},3),['Découpe','Lis le mot','Explique']);
 assert.deepEqual(stagesFor({skill:'mots'},1,'Maths'),['Observe','Manipule','Réponds']);
 assert.deepEqual(stagesFor({skill:'comprehension'},3,'Univers social'),['Observe','Compare','Explique']);
});
test('feedback does not imply a clinical score',()=>{
 const html=challengeStepMarkup({skill:'syllabes'},1,'Français',true);
 assert.equal((html.match(/<span class="challenge-step/g)||[]).length,3);
 assert.match(html,/challenge-step-done/);
 assert.doesNotMatch(html,/maîtris|diagnostic|note/);
});
test('feedback remains on screen until learner chooses to continue',()=>{
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('challengeStepMarkup(q,gradeFor(p),session.subject,Boolean(feedback))'));
 assert.ok(app.includes('session.index+(feedback?1:0)'));
 assert.ok(!app.includes("if(feedback==='correct')nextWordTimer=setTimeout"));
 assert.ok(app.includes('À toi de choisir quand continuer'));
});
test('both worlds show a concrete challenge',()=>{
 const worlds=readFileSync(new URL('../../src/worlds.js',import.meta.url),'utf8');
 assert.ok(worlds.includes('Défi : assembler puis choisir'));
 assert.ok(worlds.includes('Défi : découper et expliquer'));
});
