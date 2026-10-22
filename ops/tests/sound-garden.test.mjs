import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fresh,save,load} from '../../src/engine.js';
import {gardenSounds,gardenPractice,soundGardenMarkup} from '../../src/sound-garden.js';
test('36 distinct sound references with a recorded-audio control, no synthetic phonemes',()=>{
 assert.equal(gardenSounds.length,36);assert.equal(new Set(gardenSounds.map(c=>c.id)).size,36);
 for(const c of gardenSounds){assert.ok(c.instruction);assert.equal(new URL(c.reference).hostname,'www.phonetique.ulaval.ca');}
 const markup=soundGardenMarkup();assert.equal((markup.match(/data-garden-sound=/g)||[]).length,12);
 assert.equal((soundGardenMarkup({more:true}).match(/data-garden-sound=/g)||[]).length,36);
 assert.match(markup,/data-garden-listen/);assert.ok(!/<iframe/.test(markup));assert.match(markup,/pas « ma prononciation est correcte »/);
});
test('practice flowers persist per profile without changing reading mastery',()=>{
 const s=fresh();s.profiles[0].soundGardenPracticed=gardenPractice(undefined,'f');
 s.profiles[0].soundGardenPracticed=gardenPractice(s.profiles[0].soundGardenPracticed,'f');
 assert.deepEqual(s.profiles[0].soundGardenPracticed,['f']);assert.deepEqual(s.profiles[0].records,{});assert.equal(s.profiles[0].history.length,0);
 let json;const storage={getItem:()=>json,setItem:(k,v)=>json=v};save(storage,s);const reloaded=load(storage);
 assert.deepEqual(reloaded.profiles[0].soundGardenPracticed,['f']);assert.equal(reloaded.profiles[1].soundGardenPracticed,undefined);
});

test('each sound has an imported recording matching its source and checksum',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../../icons/phonemes/sources.json',import.meta.url)));
 assert.equal(manifest.recordings.length,36);
 for(const c of gardenSounds){const source=manifest.recordings.find(r=>r.id===c.id);assert.equal(source.page,c.reference);const data=readFileSync(new URL('../../'+source.file.slice(1),import.meta.url));assert.equal(data.length,source.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),source.sha256);}
});
