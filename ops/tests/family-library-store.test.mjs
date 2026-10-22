import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomBytes} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
import {FAMILY_ZIP_LIMITS,readFamilyZipDirectory,readVerifiedFamilyZip,importFamilyZip,listLocalDocuments,getLocalDocument} from '../../src/family-library-store.js';

const root='Alloprof-famille/';
const pdf=text=>Buffer.from(`%PDF-1.4\n${text}\n%%EOF\n`);
const sha=body=>createHash('sha256').update(body).digest('hex');
const catalogFor=records=>records.map((record,i)=>({id:`fixture-${i}`,archivePathSha256:sha(record.name.slice(root.length).normalize('NFC')),bytes:record.body.length,sha256:sha(record.body)}));
const code=expected=>error=>error.code===expected;
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}

// Independent ZIP fixtures use Node zlib, not the browser's decompressor.
function zip(records,{descriptor=false,descriptorSignature=true,comment=''}={}){
 const local=[],central=[];let position=0;
 for(const record of records){
  const name=Buffer.from(record.name),localName=Buffer.from(record.localName??record.name),body=record.body??Buffer.alloc(0);
  const method=record.method??8,packed=record.packed??(method===0?body:deflateRawSync(body));
  const size=record.size??body.length,crc=crc32(body),flags=record.flags??(descriptor?8:0),version=record.version??20;
  const header=Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50);header.writeUInt16LE(version,4);header.writeUInt16LE(flags,6);header.writeUInt16LE(method,8);
  if(!descriptor){header.writeUInt32LE(crc,14);header.writeUInt32LE(packed.length,18);header.writeUInt32LE(size,22);}
  header.writeUInt16LE(localName.length,26);
  const directory=Buffer.alloc(46);
  directory.writeUInt32LE(0x02014b50);directory.writeUInt16LE(20,4);directory.writeUInt16LE(version,6);directory.writeUInt16LE(flags,8);directory.writeUInt16LE(method,10);
  directory.writeUInt32LE(crc,16);directory.writeUInt32LE(packed.length,20);directory.writeUInt32LE(size,24);directory.writeUInt16LE(name.length,28);
  directory.writeUInt32LE(record.attrs??0,38);directory.writeUInt32LE(position,42);
  const trailer=descriptor?Buffer.alloc(descriptorSignature?16:12):Buffer.alloc(0);
  if(descriptor){const start=descriptorSignature?4:0;if(start)trailer.writeUInt32LE(0x08074b50);trailer.writeUInt32LE(crc,start);trailer.writeUInt32LE(packed.length,start+4);trailer.writeUInt32LE(size,start+8);}
  local.push(header,localName,packed,trailer);central.push(directory,name);position+=header.length+localName.length+packed.length+trailer.length;
 }
 const directory=Buffer.concat(central),footer=Buffer.alloc(22),note=Buffer.from(comment);
 footer.writeUInt32LE(0x06054b50);footer.writeUInt16LE(records.length,8);footer.writeUInt16LE(records.length,10);footer.writeUInt32LE(directory.length,12);footer.writeUInt32LE(position,16);footer.writeUInt16LE(note.length,20);
 return new Blob([...local,directory,footer,note]);
}

const records=[{name:root+'Premier/01-sons.pdf',body:pdf('sons')},{name:root+'Deuxieme/02-nombres.pdf',body:pdf('nombres')}];

test('verified import extracts only catalog PDFs, in catalog order, and ignores embedded HTML/manifest',async()=>{
 const events=[],input=zip([records[1],{name:root+'OUVRIR.html',body:Buffer.from('<script>throw Error("never execute")</script>')},records[0],{name:root+'sources.json',body:Buffer.from('{"sha256":"forged"}') }],{comment:'famille'});
 const result=await readVerifiedFamilyZip(input,catalogFor(records),{onProgress:p=>events.push(p)});
 assert.deepEqual(result.map(item=>item.id),['fixture-0','fixture-1']);
 assert.equal(result[0].blob.type,'application/pdf');assert.equal(await result[1].blob.text(),records[1].body.toString());
 assert.deepEqual(events.map(event=>event.completed),[0,1,2]);
 assert.equal(events.at(-1).bytes,records.reduce((sum,item)=>sum+item.body.length,0));
});

test('path digests identify NFC-normalized relative ZIP paths without publishing their names',async()=>{
 const source=[{name:root+'Profil-prive\u0301/fiche-e\u0301.pdf',body:pdf('sons')}],catalog=catalogFor(source);
 assert.equal(Object.hasOwn(catalog[0],'path'),false);
 assert.equal(catalog[0].archivePathSha256,sha('Profil-privé/fiche-é.pdf'));
 const result=await readVerifiedFamilyZip(zip(source),catalog);
 assert.equal(result[0].id,'fixture-0');
 assert.equal(await result[0].blob.text(),source[0].body.toString());
 assert.deepEqual(Object.keys(result[0]).sort(),['blob','bytes','id','sha256']);
 const renamed=[{...source[0],name:root+'autre/fiche-é.pdf'}];
 await assert.rejects(readVerifiedFamilyZip(zip(renamed),catalog),code('ARCHIVE_MISMATCH'));
});

test('catalogs require unique lowercase path digests and never fall back to raw paths',async()=>{
 const catalog=catalogFor(records),archive=zip(records);
 for(const archivePathSha256 of [undefined,'invalid',catalog[0].archivePathSha256.toUpperCase()]){
  await assert.rejects(readVerifiedFamilyZip(archive,[{...catalog[0],archivePathSha256,path:records[0].name.slice(root.length)},catalog[1]]),code('CATALOG_INVALID'));
 }
 await assert.rejects(readVerifiedFamilyZip(archive,[catalog[0],{...catalog[1],archivePathSha256:catalog[0].archivePathSha256}]),code('CATALOG_INVALID'));
 const fullPathHash=[{...catalog[0],archivePathSha256:sha(records[0].name)},catalog[1]];
 await assert.rejects(readVerifiedFamilyZip(archive,fullPathHash),code('ARCHIVE_MISMATCH'));
});

test('stored and DEFLATE archives support standard data descriptors, with or without signatures',async()=>{
 for(const method of [0,8])for(const descriptorSignature of [false,true]){
  const source=[{...records[0],method}];
  const result=await readVerifiedFamilyZip(zip(source,{descriptor:true,descriptorSignature}),catalogFor(source));
  assert.equal(await result[0].blob.text(),source[0].body.toString());
 }
});

test('large PDFs are read in bounded slices and their whole content is verified',async()=>{
 const body=Buffer.concat([Buffer.from('%PDF-1.4\n'),randomBytes(1200000),Buffer.from('\n%%EOF')]);
 const source=[{name:root+'Premier/grand.pdf',body}],archive=zip(source),reads=[];
 const file={size:archive.size,slice(start,end){reads.push(end-start);return archive.slice(start,end);},arrayBuffer(){throw Error('whole-archive read forbidden');}};
 const result=await readVerifiedFamilyZip(file,catalogFor(source));
 assert.equal(sha(Buffer.from(await result[0].blob.arrayBuffer())),sha(body));
 assert.ok(reads.length>5);assert.ok(Math.max(...reads)<=262144);
});

test('same-length edits fail the trusted SHA and a ZIP-supplied manifest cannot authorize them',async()=>{
 const changed=[{...records[0],body:pdf('xxxx')}];
 assert.equal(changed[0].body.length,records[0].body.length);
 await assert.rejects(readVerifiedFamilyZip(zip(changed),catalogFor([records[0]])),code('FILE_MISMATCH'));
});

test('missing or unknown PDF files are rejected before extraction',async()=>{
 await assert.rejects(readVerifiedFamilyZip(zip([records[0]]),catalogFor(records)),code('INCOMPLETE_ARCHIVE'));
 await assert.rejects(readVerifiedFamilyZip(zip([...records,{name:root+'extra.pdf',body:pdf('extra')}]),catalogFor(records)),code('ARCHIVE_MISMATCH'));
 const wrong=catalogFor(records);wrong[0].bytes++;
 await assert.rejects(readVerifiedFamilyZip(zip(records),wrong),code('FILE_MISMATCH'));
});

test('declared length cannot hide extra decompressed data behind a correct PDF prefix',async()=>{
 const source=[{...records[0],body:Buffer.concat([records[0].body,Buffer.alloc(100000,65)]),size:records[0].body.length}];
 await assert.rejects(readVerifiedFamilyZip(zip(source),catalogFor([records[0]])),code('FILE_MISMATCH'));
});

test('truncated streams, non-PDF payloads, and inconsistent local names are rejected',async()=>{
 const packed=deflateRawSync(records[0].body);
 await assert.rejects(readVerifiedFamilyZip(zip([{...records[0],packed:packed.subarray(0,packed.length-5)}]),catalogFor([records[0]])));
 const nonPdf=[{...records[0],body:Buffer.from('this is not a PDF')}];
 await assert.rejects(readVerifiedFamilyZip(zip(nonPdf),catalogFor(nonPdf)),code('FILE_MISMATCH'));
 await assert.rejects(readFamilyZipDirectory(zip([{...records[0],localName:root+'different.pdf'}])),code('ZIP_INVALID'));
});

test('duplicate paths, traversal, absolute paths, Windows paths and symlinks are rejected',async()=>{
 for(const name of [root+'../outside.pdf',root+'a/../b.pdf','/Alloprof-famille/file.pdf',root+'a\\b.pdf',root+'a//b.pdf','C:/Alloprof-famille/file.pdf']){
  await assert.rejects(readFamilyZipDirectory(zip([{...records[0],name}])),code('ZIP_INVALID'));
 }
 await assert.rejects(readFamilyZipDirectory(zip([records[0],records[0]])),code('DUPLICATE_FILE'));
 await assert.rejects(readFamilyZipDirectory(zip([records[0],{...records[0],name:records[0].name.replace('sons','SONS')}])),code('DUPLICATE_FILE'));
 await assert.rejects(readFamilyZipDirectory(zip([{...records[0],attrs:(0xa000<<16)>>>0}])),code('ZIP_UNSUPPORTED'));
});

test('encryption, unsupported compression and ZIP64 requirements are rejected',async()=>{
 for(const setting of [{flags:1},{flags:64},{flags:0x2000},{method:99},{version:45}])await assert.rejects(readFamilyZipDirectory(zip([{...records[0],...setting}])),code('ZIP_UNSUPPORTED'));
});

test('archive, entry, total and central-directory limits apply before expansion',async()=>{
 await assert.rejects(readFamilyZipDirectory({size:FAMILY_ZIP_LIMITS.archive+1,slice(){throw Error('must not read');}}),code('ZIP_TOO_LARGE'));
 await assert.rejects(readFamilyZipDirectory(zip([{...records[0],size:FAMILY_ZIP_LIMITS.file+1}])),code('ZIP_TOO_LARGE'));
 const total=Array.from({length:5},(_,i)=>({...records[0],name:root+i+'.pdf',size:FAMILY_ZIP_LIMITS.file}));
 await assert.rejects(readFamilyZipDirectory(zip(total)),code('ZIP_TOO_LARGE'));
 const tooMany=Array.from({length:257},(_,i)=>({name:root+i+'.txt',body:Buffer.alloc(0)}));
 await assert.rejects(readFamilyZipDirectory(zip(tooMany)),code('ZIP_INVALID'));
});

test('overlapping local records and broken footer offsets fail structural validation',async()=>{
 const original=Buffer.from(await zip(records).arrayBuffer()),footer=original.length-22,central=original.readUInt32LE(footer+16);
 const overlap=Buffer.from(original),second=central+46+Buffer.byteLength(records[0].name);overlap.writeUInt32LE(0,second+42);
 await assert.rejects(readFamilyZipDirectory(new Blob([overlap])),code('ZIP_INVALID'));
 const broken=Buffer.from(original);broken.writeUInt32LE(central-1,footer+16);
 await assert.rejects(readFamilyZipDirectory(new Blob([broken])),code('ZIP_INVALID'));
 await assert.rejects(readFamilyZipDirectory(new Blob([original.subarray(0,-1)])),code('ZIP_INVALID'));
});

test('cancellation stops validation between documents and never opens the local database',async()=>{
 const controller=new AbortController(),seen=[];
 await assert.rejects(readVerifiedFamilyZip(zip(records),catalogFor(records),{signal:controller.signal,onProgress:p=>{seen.push(p.completed);if(p.completed===1)controller.abort();}}),code('ABORTED'));
 assert.deepEqual(seen,[0,1]);
 let opens=0;const old=Object.getOwnPropertyDescriptor(globalThis,'indexedDB');
 Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:{open(){opens++;throw Error('must not write');}}});
 try{
  await assert.rejects(importFamilyZip(zip(records),{signal:controller.signal}),error=>error.name==='AbortError'&&error.code==='ABORTED');
  await assert.rejects(importFamilyZip(zip(records)),code('ARCHIVE_MISMATCH'));
  assert.equal(opens,0);
 }finally{if(old)Object.defineProperty(globalThis,'indexedDB',old);else delete globalThis.indexedDB;}
});

test('unavailable storage reports an actionable French error, while an unknown document returns null',async()=>{
 const old=Object.getOwnPropertyDescriptor(globalThis,'indexedDB');Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:undefined});
 try{assert.equal(await getLocalDocument('unknown'),null);await assert.rejects(listLocalDocuments(),error=>error.code==='STORAGE_UNAVAILABLE'&&/stockage/.test(error.message));}
 finally{if(old)Object.defineProperty(globalThis,'indexedDB',old);else delete globalThis.indexedDB;}
});
