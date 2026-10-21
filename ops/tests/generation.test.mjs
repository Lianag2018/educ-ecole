import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateNarration} from '../generate-narration.mjs';
const env={VERCEL_ENV:'production',VERCEL:'1',VERCEL_GIT_COMMIT_REF:'main',EDUC_OPENAI_API_KEY:'test-not-real'};
test('an interrupted generation publishes usable clips and sanitized diagnostics, then reuses them',async()=>{
 const cwd=process.cwd(),dir=await mkdtemp(join(tmpdir(),'educ-audio-'));process.chdir(dir);
 try{
  let calls=0;const bytes=Buffer.alloc(2000);bytes.write('ID3');
  const fetcher=async url=>{
   if(!url.includes('api.openai.com'))return {ok:false};
   calls++;
   return calls===1?{ok:true,arrayBuffer:async()=>bytes}:{ok:false,status:429,json:async()=>({error:{code:'rate_limit_exceeded',message:'private error text must not be published'}})};
  };
  const first=await generateNarration({env,fetcher});
  assert.equal(first.state,'partial');assert.equal(first.ready,1);
  assert.equal(first.error,'OpenAI narration HTTP 429 rate_limit_exceeded');
  const manifest=JSON.parse(await readFile('dist/audio/manifest.json','utf8'));
  const file=Object.values(manifest.clips)[0];assert.equal((await readFile('dist/audio/'+file)).length,2000);
  const second=await generateNarration({env,fetcher});assert.equal(second.generated,0);assert.equal(second.reused,1);
  assert.ok(!(await readFile('dist/audio/status.json','utf8')).includes('private'));
 }finally{process.chdir(cwd);await rm(dir,{recursive:true,force:true});}
});
test('a transient timeout is retried before failing the canary',async()=>{
 const cwd=process.cwd(),dir=await mkdtemp(join(tmpdir(),'educ-audio-retry-'));process.chdir(dir);
 try{
  let calls=0,waits=0;const bytes=Buffer.alloc(2000);bytes.write('ID3');
  const fetcher=async url=>{
   if(!url.includes('api.openai.com'))return {ok:false};calls++;
   if(calls===1){const e=Error('timeout');e.name='TimeoutError';throw e;}
   if(calls===2)return {ok:true,status:200,arrayBuffer:async()=>bytes};
   return {ok:false,status:401,json:async()=>({error:{code:'invalid_api_key'}})};
  };
  const result=await generateNarration({env,fetcher,waiter:async()=>{waits++;}});
  assert.equal(waits,1);assert.equal(result.ready,1);assert.equal(result.error,'OpenAI narration HTTP 401 invalid_api_key');
 }finally{process.chdir(cwd);await rm(dir,{recursive:true,force:true});}
});
