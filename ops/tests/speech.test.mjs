import test from 'node:test';
import assert from 'node:assert/strict';
import {spokenActivity,chooseReadingVoice,readingRate,GENTLE_SYSTEM_SPEED} from '../../src/speech.js';
test('syllable audio joins the word without saying visual plus signs',()=>{
 assert.equal(spokenActivity({skill:'syllabes',text:'la + pin'}),'lapin');
 assert.equal(spokenActivity({skill:'syllabes',text:'pa + ra + sol'}),'parasol');
 assert.equal(spokenActivity({skill:'maths',text:'3 + 7'}),'trois plus sept');
 assert.equal(spokenActivity({skill:'liaisons',text:'les amis'}),'les amis');
});
test('prefer a soft natural French voice, then Canadian French, and avoid male or compact voices',()=>{
 const natural=[{name:'Microsoft Antoine Online (Natural)',lang:'fr-CA',voiceURI:'m'},{name:'Microsoft Sylvie Online (Natural)',lang:'fr-CA',voiceURI:'sylvie'},{name:'Microsoft Denise Online (Natural)',lang:'fr-FR',voiceURI:'denise'},{name:'Compact',lang:'fr-CA',voiceURI:'c'}];
 assert.equal(chooseReadingVoice(natural).voiceURI,'sylvie');
 assert.equal(chooseReadingVoice(natural.filter(v=>v.voiceURI!=='sylvie')).voiceURI,'denise');
 assert.equal(chooseReadingVoice(natural,'m').voiceURI,'m');
});
test('prefer Canadian French reading voice and honor parent selection',()=>{
 const voices=[{name:'Shelley',lang:'fr-CA',voiceURI:'s'},{name:'Amélie',lang:'fr-CA',voiceURI:'a'},{name:'Julie',lang:'fr-FR',voiceURI:'j'}];
 assert.equal(chooseReadingVoice(voices).voiceURI,'a');
 assert.equal(chooseReadingVoice(voices,'s').voiceURI,'s');
 assert.equal(chooseReadingVoice([]),undefined);
});

test('reading defaults to natural, with explicit slower sound practice and safe fallback',()=>{assert.equal(readingRate(),1);assert.equal(readingRate('very-slow'),.45);assert.equal(readingRate('unexpected'),1);});
