// Voix de conteuse en ligne (voix douce des autres narrations) pour les histoires de l'école : une page à la fois.
// Chaque page lue est gardée dans l'appareil (elle ne sera payée qu'une fois); sans réseau ou si le serveur refuse, on retombe
// sur la voix de conteuse de l'appareil. Rien n'est envoyé tant que le serveur n'est pas activé par le parent.
const DB='atelier-mots-histoires',STORE='pages',VERSION='v1';
const idb=()=>globalThis.indexedDB||null;
function open(){return new Promise((res,rej)=>{const q=idb();if(!q)return rej(Error('indexeddb'));const r=q.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function tx(mode,fn){const db=await open();return new Promise((res,rej)=>{const t=db.transaction(STORE,mode),r=fn(t.objectStore(STORE));t.oncomplete=()=>{db.close();res(r?.result);};t.onerror=()=>{db.close();rej(t.error);};});}
export async function pageKey(text,voice=VERSION){const b=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(voice+'|'+String(text).normalize('NFC').trim()));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function cachedPage(text){try{const k=await pageKey(text);return (await tx('readonly',st=>st.get(k)))||null;}catch{return null;}}
export async function savePage(text,bytes){try{const k=await pageKey(text);await tx('readwrite',st=>st.put(bytes,k));return true;}catch{return false;}}
export async function clearPages(){try{await tx('readwrite',st=>st.clear());}catch{}}
const unb64=t=>{const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;};
// Quand le serveur dit non (pas activé, pas connecté, budget), on cesse d'insister un moment : la lecture de secours est immédiate.
const PAUSE_MS={401:600000,429:3600000,503:1800000,400:60000,net:120000};
let until=0;
export const storyVoicePaused=(now=Date.now())=>now<until;
export const resetStoryVoice=()=>{until=0;};
export async function getStoryAudio(text,profileId,{fetcher=globalThis.fetch,now=Date.now}={}){
 const t=String(text||'').trim();if(t.length<2||t.length>600)return null;
 const hit=await cachedPage(t);if(hit)return {bytes:hit,cached:true};
 if(storyVoicePaused(now()))return null;
 let r;try{r=await fetcher('/api/voice/story',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:t,profileId})});}
 catch{until=now()+PAUSE_MS.net;return null;}
 if(!r.ok){until=now()+(PAUSE_MS[r.status]||PAUSE_MS[503]);return null;}
 let data;try{data=await r.json();}catch{return null;}
 if(typeof data?.audio!=='string'||data.audioType!=='audio/mpeg')return null;
 const bytes=unb64(data.audio);if(bytes.byteLength<1000||bytes.byteLength>3000000)return null;
 await savePage(t,bytes);return {bytes,cached:false};
}
// Prépare la page suivante en arrière-plan, pour qu'il n'y ait pas d'attente en tournant la page.
export const prefetchStoryAudio=(text,profileId,opts)=>{if(text)getStoryAudio(text,profileId,opts).catch(()=>{});};
