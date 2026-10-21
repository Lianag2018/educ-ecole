import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {narrationCatalog,MODEL,VOICE,INSTRUCTIONS} from './narration-catalog.mjs';
const PUBLIC='https://educ-ecole.vercel.app';
export async function generateNarration({env=process.env,fetcher=fetch}={}){
 const catalog=narrationCatalog();
 if(catalog.length>2300||catalog.reduce((n,c)=>n+c.text.length,0)>150000)throw Error('Narration catalog exceeds reviewed generation limit');
 const live=env.VERCEL_ENV==='production'&&env.VERCEL==='1';
 await mkdir('dist/audio',{recursive:true});
 if(!live){await writeFile('dist/audio/manifest.json',JSON.stringify({version:1,clips:{}}));return;}
 const key=env.EDUC_OPENAI_API_KEY;if(!key)throw Error('Narration: EDUC_OPENAI_API_KEY missing from production build');
 // Only production main can generate this bounded, source-reviewed catalog.
 // Later builds reuse published files and local build cache before any paid call.
 const approved=env.VERCEL_GIT_COMMIT_REF==='main';
 if(!approved)throw Error('Narration generation requires reviewed production main');
 let previous={};
 try{const r=await fetcher(PUBLIC+'/audio/manifest.json',{redirect:'error',signal:AbortSignal.timeout(15000)});if(r.ok){const m=await r.json();if(m.version===1)previous=m.clips||{};}}catch{}
 const clips={},cache='.vercel/cache/educ-narration';await mkdir(cache,{recursive:true});
 let cursor=0,generated=0,reused=0,failed=false;
 async function one(item){
  const out='dist/audio/'+item.file,cached=cache+'/'+item.file;
  try{const b=await readFile(cached);if(b.length>1000){await copyFile(cached,out);clips[item.text]=item.file;reused++;return;}}catch{}
  if(previous[item.text]===item.file){
   const r=await fetcher(PUBLIC+'/audio/'+item.file,{redirect:'error',signal:AbortSignal.timeout(20000)});
   if(r.ok&&r.headers.get('content-type')?.startsWith('audio/')){const b=Buffer.from(await r.arrayBuffer());if(b.length>1000&&b.length<4000000){await writeFile(out,b);await writeFile(cached,b);clips[item.text]=item.file;reused++;return;}}
   throw Error('Published audio could not be reused; refusing duplicate paid generation');
  }
  const response=await fetcher('https://api.openai.com/v1/audio/speech',{method:'POST',redirect:'error',signal:AbortSignal.timeout(90000),headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,voice:VOICE,input:item.text,instructions:INSTRUCTIONS,response_format:'mp3',speed:0.85})});
  if(!response.ok)throw Error('OpenAI narration HTTP '+response.status);
  const b=Buffer.from(await response.arrayBuffer());if(b.length<1000||b.length>4000000)throw Error('Invalid audio size');
  if(!(b.subarray(0,3).toString()==='ID3'||(b[0]===255&&(b[1]&224)===224)))throw Error('Invalid MP3 response');
  await writeFile(out,b);await writeFile(cached,b);clips[item.text]=item.file;generated++;
 }
 // Canary verifies the key, model and real audio before starting the remaining work.
 await one(catalog[cursor++]);console.log('Narration: first MP3 validated. Catalog size: '+catalog.length);
 const workers=Array.from({length:6},async()=>{while(!failed){const i=cursor++;if(i>=catalog.length)return;try{await one(catalog[i]);if((generated+reused)%100===0)console.log('Narration: '+(generated+reused)+'/'+catalog.length+' audio files ready');}catch(e){failed=true;throw e;}}});
 const results=await Promise.allSettled(workers);const error=results.find(r=>r.status==='rejected');if(error)throw error.reason;
 if(Object.keys(clips).length!==catalog.length)throw Error('Incomplete audio catalog');
 await writeFile('dist/audio/manifest.json',JSON.stringify({version:1,model:MODEL,voice:VOICE,locale:'fr-CA',aiGenerated:true,clips}));
 console.log('Narration complete: '+generated+' generated; '+reused+' reused. No child recordings processed.');
}
