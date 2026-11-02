import test from 'node:test';
import assert from 'node:assert/strict';
import {alignmentChunks,mergeChunkWords} from '../mp3-alignment-chunks.mjs';
const frame=()=>{const b=Buffer.alloc(384);b.writeUInt32BE(0xfff3c4c4);return b;};
test('MP3 windows keep frame positions, overlap and complete source bytes',()=>{
 const bytes=Buffer.concat(Array.from({length:1367},frame)),c=alignmentChunks(bytes);
 assert.equal(c.length,4);assert.ok(Math.abs(c.at(-1).end-32.808)<1e-8);
 assert.equal(c[0].offset,0);assert.ok(c[1].offset<10);assert.ok(c[1].offset>=8.976);
 for(const x of c){assert.equal(x.bytes.length%384,0);assert.equal(x.bytes.readUInt32BE(0),0xfff3c4c4);}
 assert.throws(()=>alignmentChunks(bytes.subarray(0,-1)),/truncated/);
 assert.throws(()=>alignmentChunks(Buffer.from('invalid audio')),/invalid/);
});
test('overlap words have one owner and retain actual media offsets',()=>{
 const c=[{offset:0,start:0,end:10,words:[{word:'a',start:8,end:9},{word:'b',start:10,end:11}]},{offset:9,start:10,end:20,words:[{word:'a',start:0,end:.1},{word:'b',start:1,end:2},{word:'c',start:3,end:4}]}];
 assert.deepEqual(mergeChunkWords(c),[{word:'a',start:8,end:9},{word:'b',start:10,end:11},{word:'c',start:12,end:13}]);
});
