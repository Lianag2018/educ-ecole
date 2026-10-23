import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {olderReading} from '../../src/learning.js';
import {syllablePartsFor,syllableAudioFor} from '../../src/syllable-audio.js';
test('Liana 3e année: available pieces are real recordings and missing ones stay silent',()=>{
 const animation=olderReading.find(x=>x.id==='g3-sy1');
 const invitation=olderReading.find(x=>x.id==='g3-sy2');
 const a=syllablePartsFor(animation),i=syllablePartsFor(invitation);
 assert.deepEqual(a.map(x=>x?.label??null),['a','ni','ma',null]);
 assert.deepEqual(i.map(x=>x?.label??null),[null,'vi','ta',null]);
 assert.equal(a[0].category,'sons');
 assert.equal(a[1].category,'syllabes');
 assert.equal(syllableAudioFor(animation),null);
 assert.equal(syllableAudioFor(invitation),null);
});
test('Liana keeps whole-word narration and audio pieces are available without changing first grade',()=>{
 const src=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.ok(src.includes('const pieceClips=syllablePartsFor(q);'));
 assert.ok(src.includes('const q=session?.items?.[session.index],parts=q?syllablePartsFor(q):[];'));
 assert.ok(src.includes('speakText(spokenActivity(session.items[session.index]))'));
 assert.ok(src.includes('Écouter pour entendre le mot entier'));
 assert.ok(src.includes('if(a===\'silence\'){syllablePlayer.stop()'));
});
