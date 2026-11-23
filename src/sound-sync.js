// Sons de la famille : la connexion PARENT est la référence. Les modifications faites sur le Mac (connecté en parent) partent vers le serveur,
// et chaque tablette autorisée (« Appareil familial ») les reprend toute seule. Rien n'est public. Sans réseau ou sans autorisation, rien ne change.
import {getRecording,saveRecording,deleteRecording,listRecorded,loadStretchSettings,saveStretchMs,MAX_SOUND_BYTES} from './sound-bank.js';
const KEY='atelier-mots-sound-sync-v1';
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
const load=()=>{try{const v=JSON.parse(store()?.getItem(KEY)||'{}');return {ids:v?.ids&&typeof v.ids==='object'?v.ids:{},dirty:v?.dirty&&typeof v.dirty==='object'?v.dirty:{},at:Number(v?.at)||0};}catch{return {ids:{},dirty:{},at:0};}};
const save=v=>{try{store()?.setItem(KEY,JSON.stringify(v));}catch{}};
const b64=buf=>{let s='';const u=new Uint8Array(buf),n=0x8000;for(let i=0;i<u.length;i+=n)s+=String.fromCharCode.apply(null,u.subarray(i,i+n));return btoa(s);};
const unb64=t=>{const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;};
const post=async(path,body,fetcher)=>{
 let r;try{r=await fetcher(path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})});}catch{return {ok:false,status:0,code:'network'};}
 let data=null;try{data=await r.json();}catch{}
 return {ok:r.ok,status:r.status,code:data?.code||'',data};
};
const state=r=>r.ok?'ok':r.status===401?'login':r.status===0?'network':'fail';
export const SYNC_TEXT={ok:'envoyé à toutes les tablettes',login:'non envoyé : connecte-toi en mode parent (page Parents) pour mettre à jour les autres tablettes',network:'non envoyé : pas de réseau',fail:'non envoyé : le serveur des sons n’est pas prêt'};
// « dirty » : modification faite ici et pas encore envoyée. Une reprise de la référence ne l'écrase jamais.
const mark=(id,on)=>{const s=load();if(on)s.dirty[id]=1;else delete s.dirty[id];save(s);};
export async function pushSound(id,buf,{fetcher=globalThis.fetch}={}){
 if(!buf||buf.byteLength>MAX_SOUND_BYTES)return 'fail';
 mark(id,true);
 const r=await post('/api/sounds/put',{id,audio:b64(buf)},fetcher);
 if(r.ok){const s=load();if(r.data?.updatedAt)s.ids[id]=r.data.updatedAt;delete s.dirty[id];save(s);}
 return state(r);
}
export async function pushDelete(id,{fetcher=globalThis.fetch}={}){
 mark(id,true);
 const r=await post('/api/sounds/delete',{id},fetcher);if(r.ok){const s=load();delete s.ids[id];delete s.dirty[id];save(s);}return state(r);
}
export async function pushSettings({fetcher=globalThis.fetch}={}){
 const ms={};for(const [k,v] of Object.entries(loadStretchSettings()))if(Number.isFinite(Number(v)))ms[k]=Math.min(2000,Math.max(300,Math.round(Number(v))));
 mark('__ms',true);const r=await post('/api/sounds/settings',{ms},fetcher);if(r.ok)mark('__ms',false);return state(r);
}
// Envoie tout ce que cet appareil a enregistré (une fois, par exemple depuis le Mac) puis les durées.
export async function pushAll({fetcher=globalThis.fetch}={}){
 const ids=await listRecorded();let sent=0,failed=0,last='ok';
 for(const id of ids){const buf=await getRecording(id);if(!buf)continue;const buffer=buf.arrayBuffer?await buf.arrayBuffer():buf;const st=await pushSound(id,buffer,{fetcher});if(st==='ok')sent++;else{failed++;last=st;if(st==='login'||st==='network')break;}}
 let settings='ok';if(!failed)settings=await pushSettings({fetcher});
 return {sent,failed,state:failed?last:settings,total:ids.length};
}
// Reprend la référence du serveur : sons nouveaux ou modifiés, sons retirés, durées. Les sons que ce serveur n'a jamais eus restent tels quels.
export async function pullSounds({fetcher=globalThis.fetch,known=()=>true}={}){
 const listed=await post('/api/sounds/list',{},fetcher);
 if(!listed.ok)return {state:state(listed),updated:0,removed:0};
 const s=load(),remote=Array.isArray(listed.data?.sounds)?listed.data.sounds:[],seen=new Set();let updated=0,removed=0;
 for(const it of remote){
  if(!it||typeof it.id!=='string'||!known(it.id))continue;seen.add(it.id);
  if(s.dirty[it.id]||s.ids[it.id]===it.updatedAt)continue;
  const got=await post('/api/sounds/get',{id:it.id},fetcher);
  if(!got.ok||typeof got.data?.audio!=='string')continue;
  let buf;try{buf=unb64(got.data.audio);}catch{continue;}
  if(buf.byteLength<=500||buf.byteLength>MAX_SOUND_BYTES)continue;
  await saveRecording(it.id,buf);s.ids[it.id]=it.updatedAt||'';updated++;
 }
 for(const id of Object.keys(s.ids))if(!seen.has(id)&&!s.dirty[id]){await deleteRecording(id);delete s.ids[id];removed++;}
 const ms=s.dirty.__ms?null:listed.data?.ms;if(ms&&typeof ms==='object')for(const [id,v] of Object.entries(ms))if(known(id)&&Number.isFinite(Number(v))&&Number(v)>=300&&Number(v)<=2000&&loadStretchSettings()[id]!==Number(v)){saveStretchMs(id,Number(v));updated++;}
 s.at=Date.now();save(s);return {state:'ok',updated,removed};
}
export const lastPullAt=()=>load().at;
