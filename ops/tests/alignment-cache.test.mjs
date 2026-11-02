import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {alignNarration} from '../align-narration.mjs';
import {narrationCatalog} from '../narration-catalog.mjs';
test('rejected built-in transcription is diagnosed and never billed again on a later build',async()=>{
 const cwd=process.cwd(),dir=await mkdtemp(join(tmpdir(),'alignment-'));
 const item=narrationCatalog().find(x=>x.text==='Un bateau.');let calls=0;
 try{
  process.chdir(dir);await mkdir('dist/audio',{recursive:true});
  await writeFile('dist/audio/manifest.json',JSON.stringify({clips:{[item.text]:item.file}}));
  await writeFile('dist/audio/'+item.file,'fixture');
  const env={VERCEL:'1',VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main',EDUC_OPENAI_API_KEY:'test-only'};
  const fetcher=async url=>url.includes('educ-ecole')?{ok:true,json:async()=>({version:1,clips:{}})}:(calls++,{ok:true,json:async()=>({words:[{word:'autre',start:0,end:1}]})});
  await alignNarration({env,fetcher});let report=JSON.parse(await readFile('dist/audio/alignment.json'));
  assert.equal(report.failed,1);assert.equal(report.ready,0);assert.equal(report.failures[0].reason,'transcript_mismatch');
  await alignNarration({env,fetcher});report=JSON.parse(await readFile('dist/audio/alignment.json'));
  assert.equal(calls,1);assert.equal(report.calls,0);assert.equal(report.failed,1);assert.equal(report.failures[0].reason,'transcript_mismatch_cached');
 }finally{process.chdir(cwd);await rm(dir,{recursive:true,force:true});}
});
