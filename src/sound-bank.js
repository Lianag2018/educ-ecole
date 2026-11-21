// Banque de sons de la famille : enregistrements remplaçant ceux de l'application et durée d'étirement choisie, gardés SEULEMENT dans cet appareil.
const DB='atelier-mots-sons',STORE='phonemes',MS_KEY='atelier-mots-sound-ms-v1';
const idb=()=>globalThis.indexedDB||null;
function open(){return new Promise((res,rej)=>{const q=idb();if(!q)return rej(Error('IndexedDB indisponible'));const r=q.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function tx(mode,fn){const db=await open();return new Promise((res,rej)=>{const t=db.transaction(STORE,mode),s=t.objectStore(STORE),r=fn(s);t.oncomplete=()=>{db.close();res(r?.result);};t.onerror=()=>{db.close();rej(t.error);};});}
export const getRecording=async id=>{try{return (await tx('readonly',s=>s.get(id)))||null;}catch{return null;}};
export const saveRecording=(id,data)=>tx('readwrite',s=>s.put(data,id));
export const deleteRecording=id=>tx('readwrite',s=>s.delete(id));
export const listRecorded=async()=>{try{return (await tx('readonly',s=>s.getAllKeys()))||[];}catch{return [];}};
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
export const loadStretchSettings=()=>{try{const v=JSON.parse(store()?.getItem(MS_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}};
export function saveStretchMs(id,ms){const m=loadStretchSettings();if(ms==null)delete m[id];else m[id]=Math.round(ms);try{store()?.setItem(MS_KEY,JSON.stringify(m));}catch{}return m;}
export const stretchMsFor=(id,fallback)=>{const v=Number(loadStretchSettings()[id]);return Number.isFinite(v)&&v>0?v:fallback;};

// Transfert entre appareils (sans serveur) : tout est mis dans un seul fichier JSON que l'on envoie (AirDrop, courriel…) puis reçoit.
const b64=buf=>{let s='';const u=new Uint8Array(buf),n=0x8000;for(let i=0;i<u.length;i+=n)s+=String.fromCharCode.apply(null,u.subarray(i,i+n));return btoa(s);};
const unb64=t=>{const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;};
export async function exportSounds(){
 const ids=await listRecorded(),sounds={};
 for(const id of ids){const d=await getRecording(id);if(d)sounds[id]=b64(d);}
 return {app:'atelier-mots-sons',version:1,exportedAt:new Date().toISOString(),ms:loadStretchSettings(),sounds};
}
export const MAX_SOUND_BYTES=400000,MAX_SOUNDS=120;
// allowed : liste des identifiants de sons connus. Renvoie {saved,skipped,ms}. Ne touche à rien si le fichier n'est pas valide.
export async function importSounds(data,allowed){
 if(!data||data.app!=='atelier-mots-sons'||data.version!==1||typeof data.sounds!=='object'||!data.sounds)throw Error('format');
 const ok=new Set(allowed),entries=Object.entries(data.sounds);if(entries.length>MAX_SOUNDS)throw Error('trop');
 let saved=0,skipped=0;
 for(const [id,text] of entries){
  if(!ok.has(id)||typeof text!=='string'||text.length>MAX_SOUND_BYTES*1.4){skipped++;continue;}
  let buf;try{buf=unb64(text);}catch{skipped++;continue;}
  if(buf.byteLength<=500||buf.byteLength>MAX_SOUND_BYTES){skipped++;continue;}
  await saveRecording(id,buf);saved++;
 }
 let ms=0;if(data.ms&&typeof data.ms==='object')for(const [id,v] of Object.entries(data.ms))if(ok.has(id)&&Number.isFinite(Number(v))&&Number(v)>0){saveStretchMs(id,Number(v));ms++;}
 return {saved,skipped,ms};
}
