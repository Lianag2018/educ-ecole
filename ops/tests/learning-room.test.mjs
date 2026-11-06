import {test} from 'node:test';
import assert from 'node:assert/strict';
import {skipSequence,skipQuestions} from '../../src/skip-counting.js';
import {learningSongs,songsFor,songCategories} from '../../src/learning-songs.js';
import {fresh} from '../../src/engine.js';
import {subjectHome,childHome} from '../../src/child-navigation.js';
test('bonds respectent chaque pas et plafond, couvrent toutes les transitions',()=>{
 for(const step of [2,5,10])for(const limit of [20,50,100]){const seq=skipSequence(step,limit);assert.equal(seq[0],0);assert.equal(seq.at(-1),limit);assert.ok(seq.every((x,i)=>x===i*step));const seen=new Set();for(let r=0;r<seq.length;r++)for(const q of skipQuestions(step,limit,r)){assert.equal(q.to-q.from,step);assert.ok(q.to<=limit);seen.add(q.to);}assert.equal(seen.size,seq.length-1);}
 for(const [s,l] of [[0,20],[3,100],[2,101]])assert.throws(()=>skipSequence(s,l));
});
test('catalogue classé, deux questions par notion et liens HTTPS autorisés',()=>{
 assert.equal(new Set(learningSongs.map(s=>s.id)).size,learningSongs.length);
 for(const s of learningSongs){assert.ok(songCategories[s.category]);assert.ok([1,2,3].includes(s.level));assert.match(s.url,/^https:\/\//);if(s.video)assert.match(s.video,/^[a-zA-Z0-9_-]{11}$/);assert.equal(s.questions.length,2);for(const q of s.questions){assert.ok(q.choices[q.answer]);assert.equal(new Set(q.choices).size,q.choices.length);}}
 assert.ok(songsFor('french',1).every(s=>s.level===1));assert.ok(songsFor('french',3).some(s=>s.id==='adjective'));
});
test('chansons et bonds accessibles séparément dans les deux profils',()=>{for(const p of fresh().profiles){assert.match(subjectHome(p,'maths'),/data-action="skip-counting"/);assert.match(subjectHome(p,'french'),/data-action="songs-french"/);assert.match(childHome(p,'2026-11-05'),/data-action="songs-world"/);} });
