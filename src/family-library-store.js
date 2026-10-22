import {LIBRARY_ITEMS} from './family-library-data.js';
import {Inflate} from './vendor/fflate.js';

// Files stay in this browser. This module has no upload, fetch or localStorage path.
const DB_NAME='atelier-fiches-famille-v1';
const STORES=['documents','metadata'];
const ROOT='Alloprof-famille/';
const MiB=1024*1024;
export const FAMILY_ZIP_LIMITS=Object.freeze({archive:150*MiB,total:200*MiB,file:50*MiB,entries:256,directory:2*MiB});
const itemsById=new Map(LIBRARY_ITEMS.map(item=>[item.id,item]));
let activeImport=null,clearingLibrary=null;

function fail(code,message){const error=new Error(message);error.code=code;return error;}
function cancelled(){const error=fail('ABORTED','Importation annulée. Les fiches déjà présentes sont conservées.');error.name='AbortError';return error;}
function checkSignal(signal){if(signal?.aborted)throw cancelled();}
function invalid(){return fail('ZIP_INVALID','Le fichier ZIP est incomplet ou endommagé. Choisissez de nouveau l’archive familiale originale.');}
function unsupported(){return fail('ZIP_UNSUPPORTED','Ce format ZIP n’est pas pris en charge. Utilisez l’archive familiale originale, sans mot de passe.');}
function mismatch(){return fail('FILE_MISMATCH','Une fiche ne correspond pas à l’archive familiale vérifiée. Aucune fiche n’a été remplacée.');}
function progress(callback,value){try{callback?.(value);}catch{/* A display callback must not change the outcome of a completed import. */}}
function pause(){return new Promise(resolve=>setTimeout(resolve,0));}
function view(bytes){return new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);}

async function readBytes(file,start,length,signal){
 checkSignal(signal);
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(length)||start<0||length<0||start+length>file.size)throw invalid();
 let bytes;
 try{bytes=new Uint8Array(await file.slice(start,start+length).arrayBuffer());}
 catch{checkSignal(signal);throw fail('FILE_UNREADABLE','Impossible de lire ce fichier. Gardez l’archive sur l’appareil, puis réessayez.');}
 checkSignal(signal);
 if(bytes.length!==length)throw invalid();
 return bytes;
}

function safePath(name){
 if(typeof name!=='string'||!name||name.length>1024||/[\\:\u0000-\u001f\u007f]/u.test(name)||name.startsWith('/'))throw invalid();
 const parts=(name.endsWith('/')?name.slice(0,-1):name).split('/');
 if(parts.some(part=>!part||part==='.'||part==='..'))throw invalid();
 return name.normalize('NFC');
}
function decodePath(bytes){
 try{return safePath(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
 catch{throw invalid();}
}
function checkExtra(bytes){
 const data=view(bytes);
 for(let offset=0;offset<bytes.length;){
  if(offset+4>bytes.length)throw invalid();
  const tag=data.getUint16(offset,true),size=data.getUint16(offset+2,true);
  if(tag===1)throw unsupported(); // ZIP64 is unnecessary for this bounded archive.
  offset+=4+size;
  if(offset>bytes.length)throw invalid();
 }
}
function checkFormat(version,flags,method){
 // Only stored/DEFLATE, optional data descriptor and UTF-8 names. No encryption.
 if(version>20||(flags&~0x080e)!==0||![0,8].includes(method))throw unsupported();
 if(method===0&&(flags&6))throw invalid();
}

/** Read and validate ZIP headers without loading or expanding the whole archive. */
export async function readFamilyZipDirectory(file,{signal}={}){
 checkSignal(signal);
 if(!file||!Number.isSafeInteger(file.size)||typeof file.slice!=='function')throw fail('FILE_REQUIRED','Choisissez le fichier ZIP de la famille.');
 if(file.size>FAMILY_ZIP_LIMITS.archive)throw fail('ZIP_TOO_LARGE','Cette archive dépasse la limite de 150 Mio. Choisissez l’archive familiale originale.');
 if(file.size<22)throw invalid();
 const tailStart=Math.max(0,file.size-65557),tail=await readBytes(file,tailStart,file.size-tailStart,signal),end=view(tail);
 let footer=-1;
 for(let offset=tail.length-22;offset>=0;offset--){
  if(end.getUint32(offset,true)===0x06054b50&&offset+22+end.getUint16(offset+20,true)===tail.length){footer=offset;break;}
 }
 if(footer<0)throw invalid();
 const count=end.getUint16(footer+10,true),directorySize=end.getUint32(footer+12,true),directoryOffset=end.getUint32(footer+16,true);
 if(end.getUint16(footer+4,true)||end.getUint16(footer+6,true)||end.getUint16(footer+8,true)!==count||count===65535||directoryOffset===0xffffffff||directorySize===0xffffffff)throw unsupported();
 if(!count||count>FAMILY_ZIP_LIMITS.entries||directorySize>FAMILY_ZIP_LIMITS.directory||directoryOffset+directorySize!==tailStart+footer)throw invalid();
 const bytes=await readBytes(file,directoryOffset,directorySize,signal),data=view(bytes),entries=[],names=new Set();
 let offset=0,total=0;
 for(let index=0;index<count;index++){
  if(offset+46>bytes.length||data.getUint32(offset,true)!==0x02014b50)throw invalid();
  const version=data.getUint16(offset+6,true),flags=data.getUint16(offset+8,true),method=data.getUint16(offset+10,true);
  checkFormat(version,flags,method);
  const crc32=data.getUint32(offset+16,true),compressed=data.getUint32(offset+20,true),size=data.getUint32(offset+24,true);
  const nameLength=data.getUint16(offset+28,true),extraLength=data.getUint16(offset+30,true),commentLength=data.getUint16(offset+32,true),headerOffset=data.getUint32(offset+42,true);
  const next=offset+46+nameLength+extraLength+commentLength;
  if(!nameLength||nameLength>1024||next>bytes.length||headerOffset+30>directoryOffset)throw invalid();
  if(data.getUint16(offset+34,true)||compressed===0xffffffff||size===0xffffffff||headerOffset===0xffffffff)throw unsupported();
  const name=decodePath(bytes.subarray(offset+46,offset+46+nameLength));
  if(!name.startsWith(ROOT))throw fail('ARCHIVE_MISMATCH','Ce ZIP ne correspond pas au dossier Alloprof-famille attendu.');
  const identity=name.toLowerCase();
  if(names.has(identity))throw fail('DUPLICATE_FILE','Le ZIP contient une fiche en double. Utilisez l’archive familiale originale.');
  names.add(identity);
  // Reject symlinks and oversized declarations before any decompression.
  if(((data.getUint32(offset+38,true)>>>16)&0xf000)===0xa000)throw unsupported();
  if(size>FAMILY_ZIP_LIMITS.file||compressed>FAMILY_ZIP_LIMITS.file||(total+=size)>FAMILY_ZIP_LIMITS.total)throw fail('ZIP_TOO_LARGE','Les fichiers dépassent les limites prévues pour la bibliothèque familiale.');
  if(method===0&&compressed!==size)throw invalid();
  if(name.endsWith('/')&&size!==0)throw invalid();
  checkExtra(bytes.subarray(offset+46+nameLength,offset+46+nameLength+extraLength));
  entries.push({name,version,flags,method,crc32,compressed,size,headerOffset});
  offset=next;
 }
 if(offset!==bytes.length)throw invalid();
 // Match every local header to its central-directory record and reject overlap.
 const ordered=[...entries].sort((a,b)=>a.headerOffset-b.headerOffset);
 let expectedOffset=0;
 for(let index=0;index<ordered.length;index++){
  checkSignal(signal);
  const entry=ordered[index],boundary=ordered[index+1]?.headerOffset??directoryOffset;
  if(entry.headerOffset!==expectedOffset)throw invalid();
  const local=await readBytes(file,entry.headerOffset,30,signal),header=view(local);
  if(header.getUint32(0,true)!==0x04034b50||header.getUint16(4,true)!==entry.version||header.getUint16(6,true)!==entry.flags||header.getUint16(8,true)!==entry.method)throw invalid();
  const nameLength=header.getUint16(26,true),extraLength=header.getUint16(28,true);
  if(!nameLength||nameLength>1024||entry.headerOffset+30+nameLength+extraLength>boundary)throw invalid();
  const fields=await readBytes(file,entry.headerOffset+30,nameLength+extraLength,signal);
  if(decodePath(fields.subarray(0,nameLength))!==entry.name)throw invalid();
  checkExtra(fields.subarray(nameLength));
  for(const [position,expected] of [[14,entry.crc32],[18,entry.compressed],[22,entry.size]]){
   const actual=header.getUint32(position,true);
   if(actual!==expected&&(!(entry.flags&8)||actual!==0))throw invalid();
  }
  entry.dataOffset=entry.headerOffset+30+nameLength+extraLength;
  expectedOffset=entry.dataOffset+entry.compressed;
  if(expectedOffset>boundary)throw invalid();
  if(entry.flags&8){
   if(boundary-expectedOffset<12)throw invalid();
   const descriptor=await readBytes(file,expectedOffset,Math.min(16,boundary-expectedOffset),signal),dd=view(descriptor);
   const start=dd.getUint32(0,true)===0x08074b50?4:0;
   if(descriptor.length<start+12||dd.getUint32(start,true)!==entry.crc32||dd.getUint32(start+4,true)!==entry.compressed||dd.getUint32(start+8,true)!==entry.size)throw invalid();
   expectedOffset+=start+12;
  }
  if(expectedOffset!==boundary)throw invalid();
 }
 return entries;
}

function checkedCatalog(catalog){
 if(!Array.isArray(catalog)||!catalog.length||catalog.length>FAMILY_ZIP_LIMITS.entries)throw fail('CATALOG_INVALID','Le catalogue des fiches est indisponible. Rechargez la page.');
 const paths=new Map(),ids=new Set();let total=0;
 for(const item of catalog){
  // Public catalog entries contain only a digest of the private ZIP path.
  if(!item||!item.id||typeof item.id!=='string'||ids.has(item.id)||typeof item.archivePathSha256!=='string'||!/^[a-f0-9]{64}$/.test(item.archivePathSha256)||paths.has(item.archivePathSha256)||!Number.isSafeInteger(item.bytes)||item.bytes<=0||item.bytes>FAMILY_ZIP_LIMITS.file||!/^[a-f0-9]{64}$/i.test(item.sha256)||(total+=item.bytes)>FAMILY_ZIP_LIMITS.total)throw fail('CATALOG_INVALID','Le catalogue des fiches est invalide. Rechargez la page.');
  ids.add(item.id);paths.set(item.archivePathSha256,item);
 }
 return paths;
}

async function digestSha256(bytes,signal){
 checkSignal(signal);
 let digest;
 try{digest=new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes));}
 catch{checkSignal(signal);throw fail('VERIFICATION_UNAVAILABLE','La vérification du fichier a échoué. Fermez les autres applications, puis réessayez.');}
 checkSignal(signal);
 return Array.from(digest,byte=>byte.toString(16).padStart(2,'0')).join('');
}

async function expandEntry(file,entry,signal){
 const output=new Uint8Array(entry.size);let written=0;
 const accept=chunk=>{checkSignal(signal);if(written+chunk.length>output.length)throw mismatch();output.set(chunk,written);written+=chunk.length;};
 const inflater=entry.method===8?new Inflate(accept):null;
 try{
  for(let offset=0;offset<entry.compressed;offset+=262144){
   const chunk=await readBytes(file,entry.dataOffset+offset,Math.min(262144,entry.compressed-offset),signal);
   if(inflater){
    // Small input pushes bound temporary expansion even if the declared size lies.
    for(let part=0;part<chunk.length;part+=8192){const end=Math.min(part+8192,chunk.length);inflater.push(chunk.subarray(part,end),offset+end===entry.compressed);}
   }else accept(chunk);
   await pause();checkSignal(signal);
  }
  if(inflater&&!entry.compressed)inflater.push(new Uint8Array(),true);
 }catch(error){if(error.code==='ABORTED'||error.code==='FILE_MISMATCH'||error.code==='FILE_UNREADABLE')throw error;throw invalid();}
 if(written!==entry.size)throw mismatch();
 if(output.length<5||output[0]!==37||output[1]!==80||output[2]!==68||output[3]!==70||output[4]!==45)throw mismatch();
 return output;
}

/** Pure validation/extraction; accepts an explicit trusted catalog for offline tests. */
export async function readVerifiedFamilyZip(file,catalog,{onProgress,signal}={}){
 checkSignal(signal);
 const paths=checkedCatalog(catalog),entries=await readFamilyZipDirectory(file,{signal}),found=new Map();
 if(!globalThis.crypto?.subtle)throw fail('VERIFICATION_UNAVAILABLE','Ce navigateur ne permet pas de vérifier les fichiers. Ouvrez le site sécurisé dans une version récente de Safari.');
 for(const entry of entries){
  if(!entry.name.toLowerCase().endsWith('.pdf'))continue; // Never open embedded HTML or use a ZIP-provided manifest.
  // Hash the NFC-normalized UTF-8 path relative to Alloprof-famille/.
  const pathHash=await digestSha256(new TextEncoder().encode(entry.name.slice(ROOT.length).normalize('NFC')),signal);
  const item=paths.get(pathHash);
  if(!item)throw fail('ARCHIVE_MISMATCH','Ce ZIP contient des fiches qui ne font pas partie du catalogue familial.');
  if(entry.size!==item.bytes)throw mismatch();
  found.set(item.id,entry);
 }
 if(found.size!==catalog.length)throw fail('INCOMPLETE_ARCHIVE','Il manque des fiches dans ce ZIP. Choisissez l’archive familiale complète.');
 const documents=[];let bytes=0;
 progress(onProgress,{phase:'validation',completed:0,total:catalog.length,bytes});
 for(const item of catalog){
  checkSignal(signal);
  const output=await expandEntry(file,found.get(item.id),signal);
  const sha256=await digestSha256(output,signal);
  if(sha256!==item.sha256.toLowerCase())throw mismatch();
  documents.push({id:item.id,bytes:item.bytes,sha256,blob:new Blob([output],{type:'application/pdf'})});
  bytes+=item.bytes;
  progress(onProgress,{phase:'validation',completed:documents.length,total:catalog.length,bytes});
 }
 checkSignal(signal);
 return documents;
}

function storageError(error){
 if(error?.code==='ABORTED')return error;
 if(error?.name==='QuotaExceededError')return fail('STORAGE_FULL','Il manque de l’espace sur cet appareil. Les fiches déjà présentes sont conservées. Libérez de l’espace, puis réessayez.');
 return fail('STORAGE_UNAVAILABLE','Le navigateur refuse le stockage des fiches. Autorisez le stockage du site ou ouvrez Safari hors navigation privée, puis réessayez.');
}
function openDatabase(signal){
 checkSignal(signal);
 return new Promise((resolve,reject)=>{
  let request,settled=false;
  const finish=(error,db)=>{if(settled){db?.close();return;}settled=true;signal?.removeEventListener('abort',abort);error?reject(error):resolve(db);};
  const abort=()=>finish(cancelled());
  signal?.addEventListener('abort',abort,{once:true});
  try{if(!globalThis.indexedDB)throw Error();request=globalThis.indexedDB.open(DB_NAME,1);}
  catch(error){finish(storageError(error));return;}
  request.onupgradeneeded=()=>{const db=request.result;for(const name of STORES)if(!db.objectStoreNames.contains(name))db.createObjectStore(name);};
  request.onerror=()=>finish(storageError(request.error));
  request.onblocked=()=>finish(fail('STORAGE_BLOCKED','Fermez les autres onglets de l’Atelier, puis réessayez l’importation.'));
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();finish(null,db);};
 });
}
function transact(db,mode,operation,signal){
 checkSignal(signal);
 return new Promise((resolve,reject)=>{
  let transaction,failure,result;
  try{transaction=db.transaction(STORES,mode);}catch(error){reject(storageError(error));return;}
  const abort=()=>{try{transaction.abort();}catch{/* Commit may already be complete. */}};
  const cleanup=()=>signal?.removeEventListener('abort',abort);
  transaction.oncomplete=()=>{cleanup();try{resolve(typeof result==='function'?result():result);}catch(error){reject(storageError(error));}};
  transaction.onabort=()=>{cleanup();reject(signal?.aborted?cancelled():failure||storageError(transaction.error));};
  transaction.onerror=event=>{if(!failure)failure=storageError(event.target?.error||transaction.error);};
  signal?.addEventListener('abort',abort,{once:true});
  try{checkSignal(signal);result=operation(transaction);}catch(error){failure=typeof error.code==='string'?error:storageError(error);abort();}
 });
}

/** Validate all files first, then atomically replace the local library. */
export async function importFamilyZip(file,{onProgress,signal}={}){
 if(activeImport||clearingLibrary)throw fail('LIBRARY_BUSY','Une opération est déjà en cours. Attendez sa fin avant de réessayer.');
 const controller=new AbortController(),abort=()=>controller.abort();
 if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
 const run=(async()=>{
  const documents=await readVerifiedFamilyZip(file,LIBRARY_ITEMS,{onProgress,signal:controller.signal});
  const bytes=documents.reduce((sum,item)=>sum+item.bytes,0),db=await openDatabase(controller.signal);
  try{
   progress(onProgress,{phase:'enregistrement',completed:documents.length,total:documents.length,bytes});
   await transact(db,'readwrite',transaction=>{
    const blobs=transaction.objectStore('documents'),metadata=transaction.objectStore('metadata');
    // clear() and all puts share one transaction: quota, cancel or error rolls back everything.
    blobs.clear();metadata.clear();
    for(const item of documents){blobs.put(item.blob,item.id);metadata.put({id:item.id,bytes:item.bytes,sha256:item.sha256},item.id);}
   },controller.signal);
  }finally{db.close();}
  progress(onProgress,{phase:'termine',completed:documents.length,total:documents.length,bytes});
  return {count:documents.length,bytes};
 })();
 const current={controller,done:run};activeImport=current;
 try{return await run;}finally{if(activeImport===current)activeImport=null;signal?.removeEventListener('abort',abort);}
}

export async function listLocalDocuments(){
 const db=await openDatabase();
 try{return await transact(db,'readonly',transaction=>{
  const request=transaction.objectStore('metadata').getAll();
  return ()=>request.result.filter(record=>{const item=itemsById.get(record.id);return item&&record.bytes===item.bytes&&record.sha256===item.sha256.toLowerCase();}).map(({id,bytes})=>({id,bytes}));
 });}finally{db.close();}
}

export async function getLocalDocument(id){
 const item=itemsById.get(id);if(!item)return null;
 const db=await openDatabase();
 try{return await transact(db,'readonly',transaction=>{
  const metadata=transaction.objectStore('metadata').get(id),document=transaction.objectStore('documents').get(id);
  return ()=>{const record=metadata.result,blob=document.result;return record?.bytes===item.bytes&&record?.sha256===item.sha256.toLowerCase()&&blob instanceof Blob&&blob.size===item.bytes?blob:null;};
 });}finally{db.close();}
}

export async function clearFamilyLibrary(){
 if(clearingLibrary)return clearingLibrary;
 const operation=(async()=>{
  const pending=activeImport;
  if(pending){pending.controller.abort();try{await pending.done;}catch{/* A cancelled import leaves the old library intact until the clear below. */}}
  const db=await openDatabase();
  try{await transact(db,'readwrite',transaction=>{for(const name of STORES)transaction.objectStore(name).clear();});}finally{db.close();}
 })();
 clearingLibrary=operation;
 try{await operation;}finally{if(clearingLibrary===operation)clearingLibrary=null;}
}
