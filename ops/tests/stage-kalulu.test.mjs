import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {stageKalulu} from '../stage-kalulu.mjs';
import {kaluluUrl} from '../../src/kalulu-bank.js';
test('stage the exact 01 and 02 MP3 directories locally',async()=>{
 const root=await mkdtemp(join(tmpdir(),'kalulu-stage-'));
 const mp3=Buffer.concat([Buffer.from('ID3'),Buffer.alloc(700,1)]);
 const calls=[];
 try{
  const count=await stageKalulu({root,entries:[{category:'sons',name:'m-m'},{category:'syllabes',name:'mi'}],fetcher:async url=>{calls.push(url);return new Response(mp3,{status:200});}});
  assert.equal(count,2);
  assert.deepEqual(await readFile(join(root,'audio/kalulu/sons/m-m.mp3')),mp3);
  assert.deepEqual(await readFile(join(root,'audio/kalulu/syllabes/mi.mp3')),mp3);
  assert.equal(kaluluUrl('syllabes','mi'),'/audio/kalulu/syllabes/mi.mp3');
  assert.equal(calls.length,2);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('fail closed on non-MP3 bytes, with at most two attempts',async()=>{
 const root=await mkdtemp(join(tmpdir(),'kalulu-bad-'));let calls=0;
 try{
  await assert.rejects(stageKalulu({root,entries:[{category:'syllabes',name:'mi'}],fetcher:async()=>{calls++;return new Response('not mp3',{status:200});}}),/kalulu_download_failed/);
  assert.equal(calls,2);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('the lesson prefers local syllables and keeps narrator only as fallback',()=>{
 const src=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.ok(src.includes("if(category==='syllabes'&&msg.startsWith('Le son est indisponible'))"));
 assert.ok(src.includes('syllablePlayer.play(category,name,status)'));
});
