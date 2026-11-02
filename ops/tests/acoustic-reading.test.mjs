import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {storyCards} from '../../src/learning.js';
import {activityPages} from '../../src/beginner-access.js';
import {readingCues} from '../../src/guided-reading.js';
import {validReadingAlignment,verifiedReadingPosition} from '../../src/reading-timing.js';
import {NarrationSpeaker} from '../../src/narration.js';
const data=JSON.parse(readFileSync(new URL('../../src/reading-acoustic-data.json',import.meta.url))),clips=data.clips;
test('acoustic assets cover every story in both profiles and every displayed syllable',()=>{
 for(const id of ['p1','p2'])for(const story of storyCards({id})){
  const entry=Object.values(clips).find(e=>e.text===story.text);assert.ok(entry,story.id);assert.ok(validReadingAlignment(entry,story.text));
  for(const token of readingCues(story.text).tokens.filter(t=>/[\p{L}\p{N}]/u.test(t.text))){
   for(let partIndex=0;partIndex<token.parts.length;partIndex++)assert.ok(entry.syllables.some(c=>c.charIndex===token.start&&c.partIndex===partIndex),`${story.id}: ${token.text}/${partIndex}`);
  }
 }
});
test('real acoustic intervals are ordered, source-bound and use actual start/end events',()=>{
 for(const [file,entry] of Object.entries(clips)){
  assert.match(file,/^[a-f0-9]{64}\.mp3$/);assert.ok(validReadingAlignment(entry,entry.text),file);
  assert.equal(validReadingAlignment({...entry,audioSha256:'changed'},entry.text),false);
  for(const c of entry.syllables){const p=verifiedReadingPosition(entry,entry.text,(c.start+c.end)/2);assert.equal(p.charIndex,c.charIndex);assert.equal(p.partIndex,c.partIndex);}
 }
});
test('every short page uses the original audio with syllable offsets remapped for either child',async()=>{
 class Audio{pause(){}setAttribute(){}removeAttribute(){}play(){return Promise.resolve();}}
 const manifest=Object.fromEntries(Object.entries(clips).map(([f,e])=>[e.text,f]));let fallback=0;
 const player=new NarrationSpeaker({AudioClass:Audio,fallback:{stop(){},speak(){fallback++;}},fetcher:async url=>({ok:true,json:async()=>({version:1,clips:url.includes('alignment')?clips:manifest})})});
 await Promise.all([player.ready,player.alignmentReady]);
 for(const id of ['p1','p2'])for(const story of storyCards({id}))for(const page of activityPages(story,{id})){
  const events=[];player.speak(page,{onProgress:e=>events.push(e)});assert.equal(fallback,0,story.id+' '+page);
  const entry=clips[manifest[story.text]],offset=story.text.indexOf(page);player.audio.duration=180;
  for(const c of entry.syllables.filter(c=>c.charIndex>=offset&&c.charEnd<=offset+page.length)){
   player.audio.currentTime=(c.start+c.end)/2;player.audio.ontimeupdate?.();
   const e=events.at(-1);assert.equal(e?.charIndex,c.charIndex-offset,story.id+' '+page);assert.equal(e.partIndex,c.partIndex);
  }
  player.stop();
 }
});
