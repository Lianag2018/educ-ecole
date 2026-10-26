// Private, additive storage. Separate from profiles, results and the Alloprof ZIP.
export const PHOTO_GAMES=Object.freeze({sounds:{label:'Jardin des sons',subject:'Français'},syllables:{label:'Syllabes',subject:'Français'},vocabulary:{label:'Mots à pratiquer',subject:'Français'},reading:{label:'Lecture',subject:'Français'},numbers:{label:'Nombres',subject:'Maths'},maths:{label:'Petits calculs',subject:'Maths'},social:{label:'Univers social',subject:'Univers social'}});
export const PHOTO_KINDS=Object.freeze({week:'Feuille de la semaine',words:'Mots à pratiquer',book:'Page de livre ou cahier',other:'Autre document scolaire'});
export const PHOTO_BATCH_LIMIT=8;
const DB='atelier-school-photos-v1',stores=['metadata','images'];
const validProfile=id=>['p1','p2'].includes(id);
export function photoAssociation(input,profileId){
 if(!validProfile(profileId)||input?.profileId!==profileId||!/^\d{4}-\d{2}-\d{2}$/.test(input.week)||!Number.isFinite(Date.parse(input.week+'T12:00:00Z'))||new Date(input.week+'T12:00:00Z').toISOString().slice(0,10)!==input.week||!Object.hasOwn(PHOTO_GAMES,input.game)||PHOTO_GAMES[input.game].subject!==input.subject||!Object.hasOwn(PHOTO_KINDS,input.kind)||typeof input.title!=='string'||!input.title.trim()||input.title.trim().length>120||typeof input.note!=='string'||input.note.length>300)throw Error('association_invalid');
 return {profileId,week:input.week,subject:input.subject,game:input.game,kind:input.kind,title:input.title.trim(),note:input.note.trim()};
}
export async function checkedPhotoBatch(profileId,photos){
 if(!validProfile(profileId)||!Array.isArray(photos)||!photos.length||photos.length>PHOTO_BATCH_LIMIT)throw Error('photos_required');
 const checked=[];
 for(const photo of photos){
  const association=photoAssociation(photo,profileId),blob=photo.blob;
  if(!(blob instanceof Blob)||blob.type!=='image/jpeg'||blob.size<100||blob.size>1200000)throw Error('photo_invalid');
  const signature=new Uint8Array(await blob.slice(0,3).arrayBuffer());if(signature[0]!==255||signature[1]!==216||signature[2]!==255)throw Error('photo_invalid');
  const originalBytes=photo.originalBytes??blob.size,width=photo.width??null,height=photo.height??null;
  if(!Number.isSafeInteger(originalBytes)||originalBytes<1||originalBytes>15000000||((width!==null||height!==null)&&(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>2000||height>2000)))throw Error('photo_invalid');
  checked.push({...association,blob,originalBytes,bytes:blob.size,width,height});
 }
 return checked;
}
function open(){return new Promise((resolve,reject)=>{
 if(!globalThis.indexedDB){reject(Error('storage_unavailable'));return;}
 let request,blocked=false;try{request=indexedDB.open(DB,1);}catch{reject(Error('storage_unavailable'));return;}
 request.onupgradeneeded=()=>{for(const name of stores)if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name);};
 request.onsuccess=()=>{const db=request.result;if(blocked){db.close();return;}db.onversionchange=()=>db.close();resolve(db);};request.onerror=()=>reject(Error('storage_unavailable'));request.onblocked=()=>{blocked=true;reject(Error('storage_blocked'));};
});}
function transaction(db,mode,operation){return new Promise((resolve,reject)=>{
 let tx,value;try{tx=db.transaction(stores,mode);}catch{reject(Error('storage_unavailable'));return;}
 tx.oncomplete=()=>resolve(typeof value==='function'?value():value);
 tx.onabort=()=>reject(Error(tx.error?.name==='QuotaExceededError'?'storage_full':'storage_unavailable'));tx.onerror=()=>{};
 try{value=operation(tx);}catch{tx.abort();}
});}
export async function saveSchoolPhotos(profileId,photos){
 const checked=await checkedPhotoBatch(profileId,photos),db=await open(),createdAt=new Date().toISOString();
 try{return await transaction(db,'readwrite',tx=>checked.map(({blob,...association})=>{
  const record={...association,id:'photo-'+crypto.randomUUID(),createdAt,archived:false};tx.objectStore('metadata').put(record,record.id);tx.objectStore('images').put(blob,record.id);return record;
 }));}finally{db.close();}
}
export async function listSchoolPhotos(profileId,{includeArchived=false}={}){
 if(!validProfile(profileId))return [];const db=await open();
 try{return await transaction(db,'readonly',tx=>{const request=tx.objectStore('metadata').getAll();return ()=>request.result.filter(r=>r.profileId===profileId&&(includeArchived||!r.archived)).sort((a,b)=>b.week.localeCompare(a.week)||b.createdAt.localeCompare(a.createdAt));});}finally{db.close();}
}
export async function getSchoolPhoto(profileId,id){
 if(!validProfile(profileId)||typeof id!=='string'||!id.startsWith('photo-'))return null;const db=await open();
 try{return await transaction(db,'readonly',tx=>{const meta=tx.objectStore('metadata').get(id),image=tx.objectStore('images').get(id);return ()=>meta.result?.profileId===profileId&&image.result instanceof Blob?image.result:null;});}finally{db.close();}
}
export async function archiveSchoolPhoto(profileId,id,archived){
 if(!validProfile(profileId)||typeof id!=='string'||typeof archived!=='boolean')throw Error('association_invalid');const db=await open();
 try{return await transaction(db,'readwrite',tx=>{const metadata=tx.objectStore('metadata'),request=metadata.get(id);let changed=false;request.onsuccess=()=>{if(request.result?.profileId!==profileId)return;metadata.put({...request.result,archived},id);changed=true;};return ()=>changed;});}finally{db.close();}
}
