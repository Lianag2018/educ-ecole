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
// Mémoire de la session : permet de jouer tout de suite (au moment du toucher) une page déjà connue, sans attendre la base de l'appareil.
const mem=new Map();const norm=t=>String(t||'').normalize('NFC').trim();
export const peekPage=text=>mem.get(norm(text))||null;
let until=0,issue=null;
export const storyVoiceIssue=()=>issue;
export const storyVoicePaused=(now=Date.now())=>now<until;
export const resetStoryVoice=()=>{until=0;issue=null;};
export async function getStoryAudio(text,profileId,{fetcher=globalThis.fetch,now=Date.now}={}){
 const t=String(text||'').trim();if(t.length<2||t.length>600)return null;
 const hit=await cachedPage(t);if(hit){mem.set(norm(t),hit);return {bytes:hit,cached:true};}
 if(storyVoicePaused(now()))return null;
 let r;try{r=await fetcher('/api/voice/story',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:t,profileId})});}
 catch{until=now()+PAUSE_MS.net;issue={status:0,code:'network'};return null;}
 if(!r.ok){until=now()+(PAUSE_MS[r.status]||PAUSE_MS[503]);let code='',missing;try{const j=await r.json();code=j?.code||'';missing=Array.isArray(j?.missing)?j.missing.slice(0,6).map(String):undefined;}catch{}issue={status:r.status,code,missing};return null;}
 let data;try{data=await r.json();}catch{return null;}
 if(typeof data?.audio!=='string'||data.audioType!=='audio/mpeg')return null;
 const bytes=unb64(data.audio);if(bytes.byteLength<1000||bytes.byteLength>3000000)return null;
 mem.set(norm(t),bytes);await savePage(t,bytes);return {bytes,cached:false};
}
// Prépare la page suivante en arrière-plan, pour qu'il n'y ait pas d'attente en tournant la page.
export const prefetchStoryAudio=(text,profileId,opts)=>{if(text)getStoryAudio(text,profileId,opts).catch(()=>{});};

// Test du parent : un seul appel court au serveur (hors mémoire de l'appareil) pour savoir pourquoi la voix en ligne marche ou non.
export const STORY_VOICE_REASONS={
 ok:'La voix de conteuse en ligne fonctionne sur cette tablette.',
 parent_login_required:'Le serveur ne reconnaît pas cette tablette : connecte-toi en mode parent et active « tablette de la famille ».',
 story_voice_unavailable:'Le serveur n’est pas prêt : la variable EDUC_STORY_VOICE_CONFIG, la clé de voix, les tarifs de EDUC_VOICE_CONFIG ou le registre du budget manque sur Vercel (puis redéployer).',
 budget_unavailable:'Le registre du budget de la famille ne répond pas (fonction famille_reserve_voice).',
 rate_limit:'La limite de voix payante est atteinte pour le moment.',
 voice_unavailable:'Le fournisseur de voix n’a pas répondu. Réessaie dans un moment.',
 invalid_request:'Le serveur a refusé la demande de test.',
 network:'Pas de réseau.'};
export async function testStoryVoice({fetcher=globalThis.fetch}={}){
 resetStoryVoice();
 let r;try{r=await fetcher('/api/voice/story',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'Il était une fois.',profileId:'p1'})});}
 catch{return {ok:false,status:0,code:'network',message:STORY_VOICE_REASONS.network};}
 if(r.ok)return {ok:true,status:r.status,code:'ok',message:STORY_VOICE_REASONS.ok};
 let code='',missing=[];try{const j=await r.json();code=j?.code||'';if(Array.isArray(j?.missing))missing=j.missing.slice(0,6).map(String);}catch{}
 return {ok:false,status:r.status,code,missing,message:(STORY_VOICE_REASONS[code]||'Refus du serveur (code '+r.status+').')+(missing.length?' Il manque : '+missing.join(', ')+'.':'')};
}
