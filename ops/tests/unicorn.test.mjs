import test from 'node:test';
import assert from 'node:assert/strict';
import {unicornStories} from '../../src/unicorn-stories.js';
import {stories} from '../../src/garden.js';
test('original flying-sister stories are available at both reading stages',()=>{
 assert.equal(new Set(stories.map(s=>s.id)).size,stories.length);
 for(const grade of [1,3]){
  const selected=unicornStories.filter(s=>s.grade===grade);
  assert.equal(selected.length,2);
  for(const s of selected){assert.ok(stories.includes(s));assert.ok(s.choices[s.answer]);assert.ok(s.title);assert.match(s.text,/sœurs/);}
 }
 assert.ok(unicornStories.filter(s=>s.grade===1).every(s=>s.text.length<600));
 assert.ok(unicornStories.filter(s=>s.grade===3).every(s=>s.text.length>600));
});
