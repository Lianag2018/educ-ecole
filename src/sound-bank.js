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
