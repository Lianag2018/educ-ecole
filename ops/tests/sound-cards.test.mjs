import test from 'node:test';
import assert from 'node:assert/strict';
import {soundCards,soundCardMarkup,reviewedSounds} from '../../src/sound-cards.js';
import {narrationCatalog} from '../narration-catalog.mjs';
test('sound illustrations distinguish air from voicing without synthesizing isolated sounds',()=>{
 assert.equal(soundCards.f.voiced,false);assert.equal(soundCards.v.voiced,true);
 assert.ok(!soundCardMarkup('f').includes('class="sound-vibration"'));
 assert.ok(soundCardMarkup('v').includes('class="sound-vibration"'));
 const texts=narrationCatalog().map(c=>c.text);
 for(const c of Object.values(soundCards)){assert.ok(texts.includes(c.instruction));assert.ok(!texts.includes(c.held));}
 assert.deepEqual(reviewedSounds,{});
 assert.match(soundCardMarkup('v'),/attend un enregistrement vérifié/);
});
