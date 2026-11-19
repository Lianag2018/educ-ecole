import test from 'node:test';import assert from 'node:assert/strict';
import {parseWords,spellOut,checkWord,batchWords,dictationWords,normalizeWord,wordMarkup,dictationParent,DEFAULTS,BATCH_SIZE} from '../../src/magic-dictation.js';
test('les mots du parent : un par ligne, nettoyés, sans doublon ni caractère étrange',()=>{
 assert.deepEqual(parseWords('Baigné\n fenêtre ,  baigné;<b>x</b>\n\n12\nl’été\nrouge-gorge'),['baigné','fenêtre','l’été','rouge-gorge']);
 assert.deepEqual(parseWords(null),[]);assert.deepEqual(parseWords('a'.repeat(40)),[]);
});
test('les lettres sont épelées avec leur nom français',()=>{
 assert.deepEqual(spellOut('chat'),['cé','ache','a','té']);
 assert.equal(spellOut('forêt').join(', '),'effe, o, erre, e accent circonflexe, té');
 assert.equal(spellOut('garçon')[3],'cé cédille');
});
test('la vérification compare les lettres, accents compris, et dit où aider',()=>{
 assert.equal(checkWord('baigné','Baigné ').ok,true);
 const r=checkWord('baigné','bègné');assert.equal(r.ok,false);assert.deepEqual(r.wrong,[1,2]);
 const a=checkWord('forêt','foret');assert.equal(a.ok,false);assert.equal(a.accentOnly,true);
 assert.equal(checkWord('chat','cha').tooShort,true);assert.equal(checkWord('chat','chats').tooLong,true);
 assert.equal(normalizeWord('  Ba Ig né '),'baigné');
});
test('les groupes de 5 mots passent d\'abord par les mots du parent, puis ceux de l\'application, et recommencent au début',()=>{
 const liana={id:'p2',schoolContext:{stage:'3e année'},dictation:{words:['zèbre','ruisseau']}};
 const all=dictationWords(liana);assert.deepEqual(all.slice(0,3),['zèbre','ruisseau','baigné']);
 assert.equal(batchWords(liana,0).length,BATCH_SIZE);assert.deepEqual(batchWords(liana,0).slice(0,2),['zèbre','ruisseau']);
 const last=Math.ceil(all.length/BATCH_SIZE);assert.deepEqual(batchWords(liana,last),batchWords(liana,0).length?batchWords(liana,last):[]);
 const mely={id:'p1',schoolContext:{stage:'1re année'}};assert.equal(dictationWords(mely)[0],DEFAULTS.young[0]);
});
test('les listes par défaut sont de vrais mots sans doublon; le balisage échappe le HTML; le panneau parent liste les mots',()=>{
 for(const list of Object.values(DEFAULTS)){assert.equal(new Set(list).size,list.length);assert.ok(list.length>=30&&list.every(w=>/^[\p{L}'’-]+$/u.test(w)));}
 assert.ok(!/<script/.test(wordMarkup('<script>')));assert.match(wordMarkup('chat',[1]),/dm-l bad">h</);
 assert.match(dictationParent({name:'Liana',dictation:{words:['baigné'],review:['forêt']}}),/baigné[\s\S]*À revoir[^<]*forêt/);
});
