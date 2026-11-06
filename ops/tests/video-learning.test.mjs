import {test} from 'node:test';
import assert from 'node:assert/strict';
import {videoCatalog} from '../../src/video-catalog.js';
import {videoProgress,videoQuestions,recordVideoPractice,videosFor} from '../../src/video-learning.js';
import {fresh} from '../../src/engine.js';
import {childHome,subjectHome} from '../../src/child-navigation.js';
test('catalogue officiel, exercices liés à chacune des vidéos et accès des deux profils',()=>{
 assert.equal(new Set(videoCatalog.map(x=>x.id)).size,videoCatalog.length);
 assert.equal(videoCatalog.filter(x=>x.author==='Un prof et sa guitare').length,37);
 assert.equal(videoCatalog.filter(x=>x.author==='Maître Lucas').length,8);
 for(const x of videoCatalog){assert.match(x.video,/^[\w-]{11}$/);assert.match(x.url,/^https:\/\/www.youtube.com\/watch\?v=/);assert.equal(x.questions.length,2);for(const q of x.questions){assert.ok(q.choices[q.answer]);assert.equal(new Set(q.choices).size,q.choices.length);}}
 for(const p of fresh().profiles){assert.match(childHome(p,'2026-11-06'),/data-action="videos-prof"/);assert.match(childHome(p,'2026-11-06'),/data-action="videos-lucas"/);assert.match(subjectHome(p,'french'),/videos-french/);assert.ok(videosFor(p,{author:'lucas'}).some(x=>x.id==='lucas-determiners'));assert.ok(!videosFor(p).some(x=>x.level>3));assert.ok(videosFor(p,{scope:'all'}).some(x=>x.id==='prof-euler'));}
});
test('progression isolée, aides et erreurs du même jour jamais effacées',()=>{
 const [p1,p2]=fresh().profiles,id='lucas-determiners';
 assert.equal(videoProgress(p1,id,'2026-11-01').mode,'discover');
 recordVideoPractice(p1,id,[true,true],[true,false],'2026-11-01');
 recordVideoPractice(p1,id,[true,true],[false,false],'2026-11-01');
 assert.equal(videoProgress(p1,id,'2026-11-01').mode,'support');
 assert.equal(videoProgress(p2,id,'2026-11-01').mode,'discover');
 recordVideoPractice(p1,id,[true,true],[false,false],'2026-11-02');
 assert.equal(videoProgress(p1,id,'2026-11-02').mode,'review');
 recordVideoPractice(p1,id,[true,true],[false,false],'2026-11-03');
 assert.equal(videoProgress(p1,id,'2026-11-03').mode,'transfer');
 const s=videoCatalog.find(x=>x.id===id);assert.equal(videoQuestions(s,p1,'2026-11-03')[0].choices.length,3);
 recordVideoPractice(p1,id,[false,true],[false,false],'2026-11-04');
 assert.equal(videoProgress(p1,id,'2026-11-04').mode,'support');
 assert.equal(videoQuestions(s,p1,'2026-11-04')[0].choices.length,2);
 assert.deepEqual(p1.history,[]);assert.equal(p1.videoPractice[id].days.length,4);
});
test('tables : petits groupes puis transfert, niveau scolaire inchangé',()=>{
 const p=fresh().profiles[1],s=videoCatalog.find(x=>x.id==='prof-table-3');
 assert.match(videoQuestions(s,p,'2026-11-01')[0].prompt,/2 groupes/);
 for(const d of ['2026-11-01','2026-11-02'])recordVideoPractice(p,s.id,[true,true],[false,false],d);
 assert.match(videoQuestions(s,p,'2026-11-02')[0].prompt,/7 groupes/);
});
