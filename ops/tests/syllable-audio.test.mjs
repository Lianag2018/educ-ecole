import test from 'node:test';import assert from 'node:assert/strict';
import {syllableAudioFor,syllableChoiceAudio} from '../../src/syllable-audio.js';
import {readFileSync} from 'node:fs';
test('m+a selects the two recorded phonemes and the real ma recording',()=>{
 assert.deepEqual(syllableAudioFor({skill:'syllabes',text:'m + a'}),{parts:[{label:'m',id:'m-m'},{label:'a',id:'a-a'}],whole:'ma'});
 assert.equal(syllableChoiceAudio({skill:'syllabes'},'fa'),'fa');
 assert.equal(syllableChoiceAudio({skill:'syllabes'},'ma'),'ma');
});
test('unavailable combinations and non-syllables never generate guessed audio',()=>{
 assert.equal(syllableAudioFor({skill:'syllabes',text:'x + q'}),null);
 assert.equal(syllableAudioFor({skill:'mots',text:'m + a'}),null);
 assert.equal(syllableChoiceAudio({skill:'mots'},'ma'),null);
 assert.equal(syllableChoiceAudio({skill:'syllabes'},'../../private'),null);
});
test('app binds individual sounds, whole syllable and answer recordings, stops on navigation and silence',()=>{
 const src=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 for(const marker of ['data-syllable-part','data-syllable-whole','syllableChoiceAudio(q,choice)',"syllablePlayer.stop();kaluluUnmount","if(a==='silence'){syllablePlayer.stop()"])assert.ok(src.includes(marker),marker);
 assert.ok(src.includes("syllablePlayer.play(category,name,status)"));
});
