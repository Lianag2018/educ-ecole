import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {kaluluSounds,kaluluSyllables,kaluluRemoteUrl} from '../src/kalulu-bank.js';
// Verified against the user's 328-MP3 ZIP and upstream Git LFS pointer.
const VERIFIED=new Map([
 ['syllabes/ma','6003518e5f8eee3ef807587a75eb2310f469e8e2181ec40de426287285c9f1a1'],
 ['syllabes/fa','38486d4febbd65f7a85555ad08c851fdf50dc160a11f828c6eef3e765e2cac5a']
]);
const validMp3=bytes=>bytes.length>400&&(bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224));
export async function stageKalulu({fetcher=fetch,root='dist',entries,workers=8}={}){
 const items=entries||[...kaluluSounds.map(name=>({category:'sons',name})),...kaluluSyllables.map(name=>({category:'syllabes',name}))];
 if(!entries&&(items.length!==328||kaluluSounds.length!==105||kaluluSyllables.length!==223))throw Error('kalulu_inventory_mismatch');
 const folder=join(root,'audio','kalulu');await mkdir(join(folder,'sons'),{recursive:true});await mkdir(join(folder,'syllabes'),{recursive:true});
 let cursor=0,done=0;
 async function worker(){
  while(cursor<items.length){
   const {category,name}=items[cursor++],url=kaluluRemoteUrl(category,name);
   if(!url)throw Error('kalulu_unknown_item');
   let data,lastError;
   for(let attempt=0;attempt<2;attempt++){
    try{
     const response=await fetcher(url,{signal:AbortSignal.timeout(15000),redirect:'follow'});
     if(!response.ok)throw Error('http_'+response.status);
     data=Buffer.from(await response.arrayBuffer());
     if(!validMp3(data))throw Error('invalid_mp3');
     const expected=VERIFIED.get(category+'/'+name);
     if(expected&&createHash('sha256').update(data).digest('hex')!==expected)throw Error('sha256_mismatch');
     lastError=null;break;
    }catch(error){lastError=error;data=null;}
   }
   if(lastError)throw Error('kalulu_download_failed:'+category+'/'+name+':'+lastError.message);
   await writeFile(join(folder,category,name+'.mp3'),data);
   done++;
  }
 }
 await Promise.all(Array.from({length:Math.min(workers,items.length)},()=>worker()));
 if(done!==items.length)throw Error('kalulu_incomplete');
 console.log('Kalulu bundled locally:',done,'MP3');
 return done;
}
