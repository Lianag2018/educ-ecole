import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {narrationCatalog} from './narration-catalog.mjs';
import {numberWords} from '../src/numbers.js';
const normalized=s=>s.toLocaleLowerCase('fr-CA').replaceAll('œ','oe').normalize('NFD').replace(/[^a-z0-9]/g,'');
// Match ordered lexical units; small transcription spelling differences must not
// discard an entire story. Unmatched words never receive invented timestamps.
export function alignWords(text,words){
 if(!Array.isArray(words)||!words.length)return null;
 const split=s=>Array.from(s.matchAll(/[\p{L}\p{N}]+/gu),m=>({value:normalized(m[0]),index:m.index,length:m[0].length}));
 const source=split(text),heard=[];let last=0;
 for(const w of words){
  if(!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<last||w.end<w.start||w.end>180)return null;
  for(const part of split(w.word||''))heard.push({...part,start:w.start,end:w.end});last=w.start;
 }
 if(!source.length||!heard.length||source.length>1000||heard.length>1000)return null;
 const rows=Array.from({length:source.length+1},()=>new Uint16Array(heard.length+1));
 for(let i=source.length-1;i>=0;i--)for(let j=heard.length-1;j>=0;j--)rows[i][j]=source[i].value===heard[j].value?1+rows[i+1][j+1]:Math.max(rows[i+1][j],rows[i][j+1]);
 if(rows[0][0]/source.length<.90||rows[0][0]/heard.length<.90)return null;
 const cues=[];let i=0,j=0,missed=0;
 while(i<source.length&&j<heard.length){
  if(source[i].value===heard[j].value){
   if(missed>2)return null;missed=0;
   const start=heard[j].start,end=heard[j].end,charIndex=source[i].index,charEnd=charIndex+source[i].length;
   const previous=cues.at(-1);
   // Apostrophe/hyphen fragments from one timestamp are one highlighted group.
   if(previous&&previous.start===start&&previous.end===end)previous.charEnd=charEnd;
   else cues.push({start,end,charIndex,charEnd});i++;j++;
  }else if(rows[i+1][j]>=rows[i][j+1]){i++;missed++;}else j++;
 }
 return missed+source.length-i<=2&&cues.length?cues:null;
}
export async function alignNarration({env=process.env,fetcher=fetch}={}){
 if(env.VERCEL_ENV!=='production'||env.VERCEL!=='1'||env.VERCEL_GIT_COMMIT_REF!=='main')return;
 const manifest=JSON.parse(await readFile('dist/audio/manifest.json','utf8'));
 const numbers=new Set(Array.from({length:2000},(_,n)=>numberWords(n)));
 const items=narrationCatalog().filter(x=>manifest.clips[x.text]===x.file&&!numbers.has(x.text)&&!/[0-9+−=]/.test(x.text)&&x.text.trim().split(/\s+/).length>1);
 if(items.length>80)throw Error('Alignment catalog exceeds reviewed limit');
 let previous={};try{const r=await fetcher('https://educ-ecole.vercel.app/audio/alignment.json',{redirect:'error',signal:AbortSignal.timeout(15000)});if(r.ok){const data=await r.json();if(data.version===1)previous=data.clips||{};}}catch{}
 const clips={},cache='.vercel/cache/educ-alignment';await mkdir(cache,{recursive:true});
 let calls=0,failed=0;const deadline=Date.now()+8*60*1000;
 for(const item of items){
  let entry=previous[item.file];try{entry??=JSON.parse(await readFile(cache+'/'+item.file+'.json','utf8'));}catch{}
  if(entry?.text===item.text&&alignWords(item.text,entry.words)){clips[item.file]={...entry,cues:alignWords(item.text,entry.words)};continue;}
  if(!env.EDUC_OPENAI_API_KEY||Date.now()>deadline||calls>=80)continue;
  // One bounded request per clip, no paid retry. Only built-in narrator audio.
  try{
   const b=await readFile('dist/audio/'+item.file);if(b.length>2000000)throw Error();
   const form=new FormData();form.set('file',new Blob([b],{type:'audio/mpeg'}),item.file);form.set('model','whisper-1');form.set('language','fr');form.set('response_format','verbose_json');form.append('timestamp_granularities[]','word');form.set('prompt',item.text.slice(0,850));
   calls++;const r=await fetcher('https://api.openai.com/v1/audio/transcriptions',{method:'POST',redirect:'error',signal:AbortSignal.timeout(60000),headers:{Authorization:'Bearer '+env.EDUC_OPENAI_API_KEY},body:form});
   if(!r.ok)throw Error();const data=await r.json();const cues=alignWords(item.text,data.words);if(!cues){failed++;continue;}
   entry={text:item.text,words:data.words.map(({word,start,end})=>({word,start,end})),cues};clips[item.file]=entry;await writeFile(cache+'/'+item.file+'.json',JSON.stringify(entry));
  }catch{failed++;}
 }
 const report={version:1,source:'whisper-1',clips,ready:Object.keys(clips).length,total:items.length,calls,failed};
 await writeFile('dist/audio/alignment.json',JSON.stringify(report));console.log('Narration alignment:',JSON.stringify({ready:report.ready,total:report.total,calls,failed}));
}
