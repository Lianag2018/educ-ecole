import test from 'node:test';
import assert from 'node:assert/strict';
import {syllables,wordLesson,isFrenchWordModel,choiceSpeech} from '../../src/oral-learning.js';
import {rmsLessons,rmsNarrationTexts} from '../../src/rms-course.js';
import {narrationCatalog} from '../narration-catalog.mjs';
import {speechRequest} from '../generate-narration.mjs';
import {ReadingSpeaker} from '../../src/speech.js';

test('reported words and all decoding helpers speak complete French words, never isolated visual pieces',()=>{
 const expected={bibliothèque:'La bibliothèque. Bibliothèque.',choisis:'Tu choisis. Choisis.',rapporte:'Rapporte le livre. Rapporte.',après:'Après la lecture. Après.',lecture:'La lecture. Lecture.'};
 for(const [word,model] of Object.entries(expected))assert.equal(wordLesson(word),model);
 assert.deepEqual(syllables.rapporte,['ra','porte']);
 for(const word of Object.keys(syllables)){
  const model=wordLesson(word);assert.ok(isFrenchWordModel(model));assert.ok(model.toLocaleLowerCase('fr').includes(word));assert.notEqual(model,syllables[word].join('. ')+'. '+word+'.');
 }
 assert.equal(choiceSpeech('lit'),'Écoute le mot : lit.');assert.equal(choiceSpeech('3'),'3');
});
test('every course model and word button has a fresh, natural-speed French recording request',()=>{
 const catalog=narrationCatalog(),byText=new Map(catalog.map(c=>[c.text,c]));
 for(const word of [...Object.keys(syllables),...rmsLessons.map(l=>l.word)]){
  const text=wordLesson(word),item=byText.get(text);assert.ok(item,text);
  const request=speechRequest(item);assert.equal(request.input,text);assert.equal(request.speed,1);assert.match(request.instructions,/Ne bascule jamais en anglais/);assert.match(request.instructions,/n’étire aucune voyelle/);assert.match(request.instructions,/s entre voyelles/);
  assert.ok(!/^[\p{L}]{1,4}\. [\p{L}]{1,4}\./u.test(request.input));
 }
 for(const l of rmsLessons)assert.ok(rmsNarrationTexts.includes(wordLesson(l.word)));
 assert.equal(speechRequest({text:'Une phrase.'}).speed,.85);
 assert.ok(!catalog.some(c=>c.text==='bi. bli. o. thèque. bibliothèque.'||c.text==='choi. sis. choisis.'||c.text==='rap. porte. rapporte.'));
});
test('natural whole-word fallback keeps French voice and does not multiply the reading slowdown',()=>{
 const utterances=[];
 class Utterance{constructor(text){this.text=text;utterances.push(this);}}
 const synth={getVoices:()=>[{name:'English',lang:'en-US',voiceURI:'en'},{name:'Amélie',lang:'fr-CA',voiceURI:'fr'}],cancel(){},speak(){}};
 const player=new ReadingSpeaker({synth,Utterance,setTimer:()=>1,clearTimer(){}});
 const text=wordLesson('choisis');player.speak(text,{natural:true,speed:1,preferredURI:'en'});
 assert.equal(utterances[0].text,text);assert.equal(utterances[0].lang,'fr-CA');assert.equal(utterances[0].voice.voiceURI,'fr');assert.equal(utterances[0].rate,1);
 player.setSpeed(.8);assert.equal(utterances[1].rate,.8);
 player.speak('Une histoire.',{speed:1});assert.equal(utterances[2].rate,.65);player.stop();
});
