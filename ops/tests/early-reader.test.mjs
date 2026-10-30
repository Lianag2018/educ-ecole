import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh} from '../../src/engine.js';
import {storyCards,skillCards} from '../../src/learning.js';
import {beginnerCard,activityPages} from '../../src/beginner-access.js';
import {earlyReaderStories,readerBlends} from '../../src/early-reader.js';
import {subjectHome} from '../../src/child-navigation.js';
test('Short books keep the complete reading and are distinct from listening practice',()=>{
 const [p]=fresh().profiles, before=JSON.stringify(p);
 for(const q of earlyReaderStories){assert.equal(beginnerCard(q,p),q);assert.deepEqual(activityPages(q,p),[q.text]);assert.equal(q.learningMode,'reading');assert.equal(q.travelSubject,'Lecture');assert.ok(q.choices[q.answer]);assert.ok(q.text.split(/[.!?]/).filter(x=>x.trim()).length>=3);}
 assert.equal(storyCards(p)[0].id,earlyReaderStories[0].id);assert.equal(JSON.stringify(p),before);
});
test('Word practice starts with two/three syllables while preserving elementary review and older content',()=>{
 const [p1,p2]=fresh().profiles;
 assert.equal(skillCards(p1,'syllabes')[0].id,readerBlends[0].id);
 assert.ok(skillCards(p1,'syllabes').some(q=>q.id==='first-blend-la'));
 assert.ok(!skillCards(p2,'syllabes').some(q=>q.readerBlend));
 assert.ok(!storyCards(p2).some(q=>q.earlyReader));
 for(const q of readerBlends)assert.equal(q.text.replace(/\s|\+/g,''),q.choices[q.answer]);
 assert.match(subjectHome(p1,'french'),/Je lis de petites histoires/);
});
