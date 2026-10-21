import test from 'node:test';
import assert from 'node:assert/strict';
import {spokenActivity,chooseReadingVoice,readingRate} from '../../src/speech.js';
test('syllable audio joins the word without saying visual plus signs',()=>{
 assert.equal(spokenActivity({skill:'syllabes',text:'la + pin'}),'lapin');
 assert.equal(spokenActivity({skill:'syllabes',text:'pa + ra + sol'}),'parasol');
 assert.equal(spokenActivity({skill:'maths',text:'3 + 7'}),'3 + 7');
 assert.equal(spokenActivity({skill:'liaisons',text:'les amis'}),'les amis');
});
test('prefer Canadian French reading voice and honor parent selection',()=>{
 const voices=[{name:'Shelley',lang:'fr-CA',voiceURI:'s'},{name:'Amélie',lang:'fr-CA',voiceURI:'a'},{name:'Julie',lang:'fr-FR',voiceURI:'j'}];
 assert.equal(chooseReadingVoice(voices).voiceURI,'a');
 assert.equal(chooseReadingVoice(voices,'s').voiceURI,'s');
 assert.equal(chooseReadingVoice([]),undefined);
});

test('reading defaults to slow, with slower sound practice and safe fallback',()=>{assert.equal(readingRate(),.65);assert.equal(readingRate('very-slow'),.45);assert.equal(readingRate('unexpected'),.65);});
