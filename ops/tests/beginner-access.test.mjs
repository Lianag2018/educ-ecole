import {test} from 'node:test';
import assert from 'node:assert/strict';
import {beginnerCard,activityPages,beginnerMathVisual} from '../../src/beginner-access.js';
import {bank} from '../../src/content.js';
import {stories} from '../../src/garden.js';
import {olderReading,mathsFor,socialFor} from '../../src/learning.js';
import {islandCards,islandChapters} from '../../src/dominican-adventure.js';
import {travelCards,destinations} from '../../src/voyage.js';
import {fresh,answer,level} from '../../src/engine.js';
const [p1,p2]=fresh().profiles;
const readings=[...bank.filter(q=>q.skill==='comprehension'),...stories.filter(q=>q.grade===1),socialFor(p1),...islandChapters.flatMap(c=>islandCards(p1,c.id)),...destinations.flatMap(c=>travelCards(p1,c.id))];
test('All beginner story entrypoints have short authored variants and valid answers',()=>{
 for(const original of readings){const q=beginnerCard(original,p1);assert.ok(q.choices[q.answer],q.id);if(q.skill==='comprehension'){assert.equal(q.learningMode,'listening');assert.ok(q.text.split(/\s+/).length<=14,q.id);assert.ok(activityPages(q,p1).every(x=>x.split(/\s+/).length<=8),q.id);assert.equal(q.travelSubject,'Compréhension orale');}}
});
test('Grade three retains its complete stories and inference questions',()=>{
 for(const q of [...olderReading,...stories.filter(q=>q.grade===3),...islandCards(p2,'bateau')])assert.equal(beginnerCard(q,p2),q);
});
test('Listening comprehension does not advance independent reading level or cross profiles',()=>{
 const p=fresh().profiles[0],q=beginnerCard(readings[0],p);for(const d of ['2026-10-20','2026-10-21','2026-10-22'])answer(p,q,'correct',d,q.travelSubject);assert.equal(level(p,'comprehension'),1);assert.equal(p2.history.length,0);
});
test('Unknown school material is preserved and paged without inventing simplified content',()=>{
 const q={id:'private',text:'Voici une phrase. Puis une autre!',skill:'mots',choices:[]};const adapted=beginnerCard(q,p1);assert.equal(adapted.text,q.text);assert.deepEqual(activityPages(adapted,p1),['Voici une phrase.','Puis une autre!']);assert.deepEqual(activityPages(q,p2),[q.text]);
});
test('First-year arithmetic shows all operands and marks removed objects',()=>{
 for(const q of mathsFor(p1).map(q=>beginnerCard(q,p1,'Maths')).filter(q=>q.beginnerMath)){const [a,op,b]=q.beginnerMath,html=beginnerMathVisual(q);assert.equal((html.match(/<circle /g)||[]).length,op==='+'?a+b:a);assert.equal((html.match(/<path /g)||[]).length,op==='−'?b:0);assert.equal(+q.choices[q.answer],op==='+'?a+b:a-b);}
});
