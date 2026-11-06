import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGrokAudio,connectGrok} from '../../src/grok-audio.js';
const relayUrl='wss://legkfinwvtyavynngoea.supabase.co/functions/v1/educ-grok-relay';

test('device audio rate remains native when a forced 24 kHz rate is unsupported',async()=>{
 const original=globalThis.AudioContext;let closed=0,resumed=0;
 globalThis.AudioContext=class {constructor(options){if(options?.sampleRate)throw new DOMException('unsupported rate','NotSupportedError');this.sampleRate=48000;}resume(){resumed++;return Promise.resolve();}close(){closed++;return Promise.resolve();}};
 try{const lease=prepareGrokAudio();assert.equal(lease.audio.sampleRate,48000);assert.equal(resumed,1);await lease.resumed;lease.close();lease.close();assert.equal(closed,1);}finally{globalThis.AudioContext=original;}
});

function fixture(){
 let socket,node,closed=0;const sent=[],played=[],buffers=[];
 const audio={sampleRate:48000,currentTime:0,destination:{},
  createMediaStreamSource(){return {connect(){},disconnect(){}};},
  createScriptProcessor(){node={connect(){},disconnect(){}};return node;},
  createGain(){return {gain:{value:1},connect(){},disconnect(){}};},
  createBuffer(channels,length,rate){const data=new Float32Array(length);const b={duration:length/rate,getChannelData:()=>data};buffers.push({channels,length,rate,data});return b;},
  createBufferSource(){return {connect(){},start:time=>played.push(time),stop(){}};},
 };
 const Socket=class {constructor(){socket=this;this.readyState=1;this.bufferedAmount=0;}send(m){sent.push(JSON.parse(m));}close(){this.readyState=3;this.onclose?.();}};
 return {audio,Socket,get socket(){return socket;},get node(){return node;},sent,played,buffers,lease:{audio,resumed:Promise.resolve(),close(){closed++;}},get closed(){return closed;}};
}

test('native 48 kHz capture is sent as 24 kHz PCM and received PCM plays at its declared rate',async()=>{
 const original=globalThis.WebSocket,f=fixture();globalThis.WebSocket=f.Socket;let closed=0;
 try{
  const pending=connectGrok({relayUrl,ticket:'synthetic'}, {},{audioLease:f.lease,onClose:()=>closed++});await new Promise(r=>setImmediate(r));
  f.socket.onopen();assert.deepEqual(f.sent,[{type:'authenticate',ticket:'synthetic'}]);
  f.socket.onmessage({data:'{"type":"ready"}'});const connection=await pending;
  f.node.onaudioprocess({inputBuffer:{getChannelData:()=>new Float32Array(2048).fill(.5)}});
  const pcm=Buffer.from(f.sent.at(-1).data,'base64');assert.equal(pcm.length,2048);assert.equal(pcm.readInt16LE(0),16384);
  f.socket.onmessage({data:JSON.stringify({type:'audio',data:Buffer.from([0,128,0,0,255,127]).toString('base64')})});
  assert.equal(f.buffers[0].rate,24000);assert.equal(f.buffers[0].length,3);assert.equal(f.buffers[0].data[0],-1);assert.equal(f.played.length,1);
  connection.close();assert.equal(f.closed,1);assert.equal(closed,0);
 }finally{globalThis.WebSocket=original;}
});

test('failed handshake rejects once without an early close callback masking the error',async()=>{
 const original=globalThis.WebSocket,f=fixture();globalThis.WebSocket=f.Socket;let closed=0;
 try{const pending=connectGrok({relayUrl,ticket:'synthetic'}, {},{audioLease:f.lease,onClose:()=>closed++});await new Promise(r=>setImmediate(r));f.socket.onerror();await assert.rejects(pending,/connection_failed/);assert.equal(closed,0);assert.equal(f.closed,1);}finally{globalThis.WebSocket=original;}
});

test('an established connection reports a remote close once and releases audio',async()=>{
 const original=globalThis.WebSocket,f=fixture();globalThis.WebSocket=f.Socket;let closed=0;
 try{const pending=connectGrok({relayUrl,ticket:'synthetic'}, {},{audioLease:f.lease,onClose:()=>closed++});await new Promise(r=>setImmediate(r));f.socket.onmessage({data:'{"type":"ready"}'});await pending;f.socket.onclose();assert.equal(closed,1);assert.equal(f.closed,1);}finally{globalThis.WebSocket=original;}
});
