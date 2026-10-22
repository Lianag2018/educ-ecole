import test from 'node:test';
import assert from 'node:assert/strict';
import {firstSounds,firstBlends,firstWords} from '../../src/first-reading.js';
import {spokenActivity} from '../../src/speech.js';
import {oralQuestion,wordLesson} from '../../src/oral-learning.js';
import {narrationCatalog} from '../narration-catalog.mjs';
test('beginner foundations teach distinct u, ou and on with spoken instructions',()=>{
 const cards=[...firstSounds,...firstBlends,...firstWords];
 assert.equal(cards.length,28);assert.equal(new Set(cards.map(q=>q.id)).size,28);
 for(const q of cards){assert.ok(q.choices[q.answer]);assert.ok(oralQuestion(q).includes(q.introLesson??q.lesson));assert.ok(!spokenActivity(q).includes('+'));}
 const by=id=>firstSounds.find(q=>q.id==='first-sound-'+id);
 assert.equal(by('u').choices[by('u').answer],'lune');assert.equal(by('ou').choices[by('ou').answer],'roue');assert.equal(by('on').choices[by('on').answer],'ballon');
 assert.equal(wordLesson('lapin'),'la. pin. lapin.');assert.equal(wordLesson('midi'),'mi. di. midi.');
});
test('all eight blend introductions stay neutral while the requested audio still supplies the model',()=>{
 const expected='Regarde les lettres affichées. Essaie de les lire ensemble. Tu peux écouter un modèle avec le bouton Écouter. Lis les lettres ensemble, puis retrouve la syllabe. Touche le haut-parleur pour écouter chaque choix, puis touche ta réponse.';
 assert.equal(firstBlends.length,8);
 for(const q of firstBlends){
  assert.equal(oralQuestion(q),expected,q.id);
  assert.ok(!oralQuestion(q).includes(q.lesson),q.id);
  assert.equal(spokenActivity(q),q.choices[q.answer]+'.',q.id);
  assert.match(q.lesson,/^Écoute le début du mot /,q.id);
  assert.ok(q.explanation.includes(`ensemble : ${q.choices[q.answer]},`),q.id);
 }
 assert.equal(new Set(firstBlends.map(oralQuestion)).size,1);
});
test('phonics recordings carry French pronunciation instructions and distinct cache hashes',()=>{
 const c=narrationCatalog();
 for(const text of ['Du pain. Le pain.','Une main.','la.','la. pin. lapin.']){const clip=c.find(x=>x.text===text);assert.ok(clip,text);assert.match(clip.instructions,/Ne bascule jamais en anglais/);assert.match(clip.instructions,/u de lune/);}
});

test('sound associations explicitly identify the target and use one matching choice',()=>{
 const expected={a:'avion',i:'image',o:'vélo',u:'lune',eacute:'bébé',egrave:'sel',m:'moto',l:'lit',s:'soleil',f:'fil',ou:'roue',on:'ballon',ch:'chat',in:'lapin'};
 for(const q of firstSounds){assert.equal(q.choices[q.answer],expected[q.id.replace('first-sound-','')]);assert.ok(q.soundTarget);assert.ok(q.oralPrompt.includes(q.model));assert.ok(!q.spokenText.includes('Écoute le mot français'));assert.ok(!q.choices.filter((_,i)=>i!==q.answer).includes(q.choices[q.answer]));}
});

test('all fourteen sound introductions withhold the matching choice and preserve the full requested model',()=>{
 const originalModels={
  a:'Ouvre bien la bouche. Écoute le début du mot ami.',
  i:'Étire doucement les lèvres. Écoute le début du mot ici.',
  o:'Arrondis les lèvres. Écoute le son à la fin de vélo.',
  u:'Arrondis les lèvres. Écoute : une, lune. Le son de lune est différent de celui de roue.',
  eacute:'Écoute : été, bébé. On entend le même son à la fin.',
  egrave:'Écoute : aile, sel. Cherche le son que ces mots ont en commun.',
  m:'Ferme les lèvres et fais vibrer ta voix. Écoute le début de maman.',
  l:'Place la pointe de la langue derrière les dents du haut. Écoute le début de lune.',
  s:'Écoute le début de sac. Tu peux prolonger ce son doucement.',
  f:'Pose les dents du haut sur la lèvre du bas et souffle doucement. Écoute le début de four.',
  ou:'Écoute : loup, roue. Les lettres o et u travaillent ensemble pour représenter ce son.',
  on:'Écoute : rond, ballon. À la fin, le son résonne aussi dans le nez. Ne prononce pas la lettre n séparément.',
  ch:'Écoute le début de chou. Les lettres c et h représentent ensemble ce son. Souffle doucement.',
  in:'Écoute : sapin, lapin. À la fin, le son résonne aussi dans le nez. Ne prononce pas la lettre n séparément.'
 };
 assert.equal(firstSounds.length,14);
 for(const q of firstSounds){
  const id=q.id.replace('first-sound-',''),answer=q.choices[q.answer];
  const wholeAnswer=new RegExp(`(?<![\\p{L}\\p{M}])${answer}(?![\\p{L}\\p{M}])`,'iu');
  assert.doesNotMatch(oralQuestion(q),wholeAnswer,q.id);
  assert.equal(q.spokenText,originalModels[id],q.id);
  assert.equal(q.lesson,originalModels[id]+' Tu peux répéter après moi.',q.id);
  assert.equal(q.explanation,`Écoute : ${q.model}, ${answer}. On entend le son travaillé dans ces deux mots.`,q.id);
 }
});
