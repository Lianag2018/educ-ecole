import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {narrationCatalog,MODEL,VOICE,INSTRUCTIONS} from './narration-catalog.mjs';
const PUBLIC='https://educ-ecole.vercel.app';
export async function generateNarration({env=process.env,fetcher=fetch,waiter=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 const catalog=narrationCatalog();
 if(catalog.length>2300||catalog.reduce((n,c)=>n+c.text.length,0)>150000)throw Error('Narration catalog exceeds reviewed generation limit');
 const live=env.VERCEL_ENV==='production'&&env.VERCEL==='1';
 await mkdir('dist/audio',{recursive:true});
 if(!live){await writeFile('dist/audio/manifest.json',JSON.stringify({version:1,clips:{}}));return;}
 const key=env.EDUC_OPENAI_API_KEY;
 // Only production main can generate this bounded, source-reviewed catalog.
 // Later builds reuse published files and local build cache before any paid call.
 const approved=env.VERCEL_GIT_COMMIT_REF==='main';
 if(!approved)throw Error('Narration generation requires reviewed production main');
 let previous={};
 try{const r=await fetcher(PUBLIC+'/audio/manifest.json',{redirect:'error',signal:AbortSignal.timeout(15000)});if(r.ok){const m=await r.json();if(m.version===1)previous=m.clips||{};}}catch{}
 const clips={},cache='.vercel/cache/educ-narration';await mkdir(cache,{recursive:true});
 let cursor=0,generated=0,reused=0,failed=false;const errors=[],deadline=Date.now()+20*60*1000;
 const safeError=e=>/^OpenAI narration HTTP \d{3}(?: [a-z_]+)?$/.test(e?.message)?e.message:e?.name==='TimeoutError'?'audio_request_timeout':e?.message==='missing_production_key'?'missing_production_key':'audio_generation_error';
 async function publish(error){
  const report={state:error?(Object.keys(clips).length?'partial':'unavailable'):'ready',ready:Object.keys(clips).length,total:catalog.length,generated,reused,error:error?safeError(error):null};
  await writeFile('dist/audio/manifest.json',JSON.stringify({version:1,model:MODEL,voice:VOICE,locale:'fr-CA',aiGenerated:true,clips}));
  await writeFile('dist/audio/status.json',JSON.stringify(report));
  console.log('Narration: '+JSON.stringify(report));
  return report;
 }
 async function one(item){
  const out='dist/audio/'+item.file,cached=cache+'/'+item.file;
  try{const b=await readFile(cached);if(b.length>1000){await copyFile(cached,out);clips[item.text]=item.file;reused++;return;}}catch{}
  if(previous[item.text]===item.file){
   const r=await fetcher(PUBLIC+'/audio/'+item.file,{redirect:'error',signal:AbortSignal.timeout(20000)});
   if(r.ok&&r.headers.get('content-type')?.startsWith('audio/')){const b=Buffer.from(await r.arrayBuffer());if(b.length>1000&&b.length<4000000){await writeFile(out,b);await writeFile(cached,b);clips[item.text]=item.file;reused++;return;}}
   throw Error('Published audio could not be reused; refusing duplicate paid generation');
  }
  let response;
  for(let attempt=0;attempt<3;attempt++){
   try{response=await fetcher('https://api.openai.com/v1/audio/speech',{method:'POST',redirect:'error',signal:AbortSignal.timeout(90000),headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,voice:VOICE,input:item.text,instructions:INSTRUCTIONS,response_format:'mp3',speed:0.85})});}
   catch(e){if(attempt===2||!['TimeoutError','TypeError'].includes(e.name))throw e;await waiter((attempt+1)*1500);continue;}
   if(response.ok||response.status<500||response.status>599||attempt===2)break;
   await response.body?.cancel();await waiter((attempt+1)*1500);
  }
  if(!response.ok){let code='';try{const data=await response.json();if(/^[a-z_]{1,50}$/.test(data.error?.code))code=' '+data.error.code;}catch{}throw Error('OpenAI narration HTTP '+response.status+code);}
  const b=Buffer.from(await response.arrayBuffer());if(b.length<1000||b.length>4000000)throw Error('Invalid audio size');
  if(!(b.subarray(0,3).toString()==='ID3'||(b[0]===255&&(b[1]&224)===224)))throw Error('Invalid MP3 response');
  await writeFile(out,b);await writeFile(cached,b);clips[item.text]=item.file;generated++;
 }
 // Publish completed clips even if a later request fails, so a subsequent build
 // can resume without paying for those clips again. Status stays explicitly partial.
 if(!key)return publish(Error('missing_production_key'));
 try{await one(catalog[cursor++]);}catch(e){return publish(e);}
 console.log('Narration: first MP3 validated. Catalog size: '+catalog.length);
 const workers=Array.from({length:3},async()=>{while(!failed){if(Date.now()>deadline){failed=true;errors.push(Error('generation_time_budget'));return;}const i=cursor++;if(i>=catalog.length)return;try{await one(catalog[i]);if((generated+reused)%100===0)console.log('Narration: '+(generated+reused)+'/'+catalog.length+' audio files ready');}catch(e){errors.push(e);const temporary=/^OpenAI narration HTTP 5\d\d/.test(e.message)||['TimeoutError','TypeError'].includes(e.name);if(!temporary||errors.length>=3){failed=true;return;}}}});
 await Promise.all(workers);
 return publish(errors[0]);
}
