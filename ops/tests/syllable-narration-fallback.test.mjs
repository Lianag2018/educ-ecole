import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syllableAudioFor,syllableChoiceAudio} from '../../src/syllable-audio.js';
import {firstBlends} from '../../src/first-reading.js';
import {spokenActivity} from '../../src/speech.js';
test('m + a uses a whole syllable pronounced ma, never m plus a letter names',()=>{
 const q=firstBlends.find(q=>q.text==='m + a');
 assert.equal(syllableAudioFor(q).whole,'ma');
 assert.equal(spokenActivity(q),'ma.');
 assert.equal(syllableChoiceAudio(q,'ma'),'ma');
});
test('all first-grade complete syllables use bundled MP3 with narrator fallback',()=>{
 const src=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(src,/if\(category==='syllabes'&&msg.startsWith\('Le son est indisponible'\)\)/);
 assert.match(src,/speakText\(name\)/);
 assert.match(src,/const local=category==='sons'\?localPhonemeForKalulu\(name\):null;/);
 assert.match(src,/phonemePlayer\.play\(local\)/);
 assert.match(src,/data-syllable-whole/);
 assert.match(src,/data-choice-audio/);
 assert.match(src,/if\(a==='silence'\)\{syllablePlayer\.stop\(\);oralCheck\.stop\(\);phonemePlayer\.stop\(\)/);
 for(const q of firstBlends)assert.ok(syllableChoiceAudio(q,syllableAudioFor(q).whole));
});
