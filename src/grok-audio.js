const RELAY='wss://legkfinwvtyavynngoea.supabase.co/functions/v1/educ-grok-relay';
export function pcmBase64(samples){
 const bytes=new Uint8Array(samples.length*2),view=new DataView(bytes.buffer);
 for(let i=0;i<samples.length;i++)view.setInt16(i*2,Math.round(Math.max(-1,Math.min(1,samples[i]))*(samples[i]<0?32768:32767)),true);
 return btoa(String.fromCharCode(...bytes));
}
// Open AudioContext during the tap; Safari may reject resume after a network await.
export function prepareGrokAudio(){
 const C=globalThis.AudioContext||globalThis.webkitAudioContext;
 // Keep the device rate. Forcing 24 kHz can fail before the permission prompt
 // or when attaching a microphone. Input is resampled below; output buffers
 // carry their own 24 kHz rate and Web Audio converts them for the device.
 if(!C)throw Error('audio_unavailable');const audio=new C();
 const resumed=audio.resume();resumed.catch(()=>{});
 let closed=false;
 return {audio,resumed,close(){if(closed)return;closed=true;audio.close().catch(()=>{});}};
}
export async function connectGrok(session,stream,{onMessage,onClose,signal,audioLease}={}){
 if(session.relayUrl!==RELAY||typeof session.ticket!=='string'||session.ticket.length>20000||!audioLease)throw Error('invalid_session');
 const audio=audioLease.audio;let socket,source,node,gain,ping,timer,closed=false,next=0;const playing=new Set();
 const clearPlayback=()=>{for(const s of playing)try{s.stop();}catch{}playing.clear();next=0;};
 const close=()=>{if(closed)return;closed=true;clearInterval(ping);clearTimeout(timer);clearPlayback();node?.disconnect();source?.disconnect();gain?.disconnect();if(node)node.onaudioprocess=null;try{socket?.close();}catch{}audioLease.close();};
 try{
  await audioLease.resumed;if(signal?.aborted)throw Error('aborted');
  socket=new WebSocket(RELAY);
  await new Promise((resolve,reject)=>{
   let ready=false;
   const fail=()=>{if(closed)return;close();reject(Error('connection_failed'));if(ready)onClose?.();};
   timer=setTimeout(fail,12000);signal?.addEventListener('abort',fail,{once:true});
   socket.onopen=()=>{if(closed)return;socket.send(JSON.stringify({type:'authenticate',ticket:session.ticket}));};
   socket.onerror=socket.onclose=fail;
   socket.onmessage=e=>{
    if(closed||typeof e.data!=='string'||e.data.length>200000)return fail();
    let m;try{m=JSON.parse(e.data);}catch{return fail();}
    if(m.type==='ready'){ready=true;clearTimeout(timer);resolve();return;}
    if(m.type==='interrupt'){clearPlayback();return;}
    if(m.type==='audio'){
     try{
      const raw=atob(m.data);if(raw.length%2||next-audio.currentTime>8)throw Error();
      const buffer=audio.createBuffer(1,raw.length/2,24000),out=buffer.getChannelData(0);
      for(let i=0;i<out.length;i++){let n=raw.charCodeAt(2*i)|(raw.charCodeAt(2*i+1)<<8);if(n>=32768)n-=65536;out[i]=n/32768;}
      const player=audio.createBufferSource();player.buffer=buffer;player.connect(audio.destination);playing.add(player);player.onended=()=>playing.delete(player);
      next=Math.max(next,audio.currentTime+.02);player.start(next);next+=buffer.duration;onMessage?.('La maîtresse répond…');
     }catch{fail();}
    }
   };
  });
  if(closed||signal?.aborted)throw Error('aborted');
  source=audio.createMediaStreamSource(stream);node=audio.createScriptProcessor(2048,1,1);gain=audio.createGain();gain.gain.value=0;
  node.onaudioprocess=e=>{
   if(closed||socket.readyState!==1)return;
   if(socket.bufferedAmount>256000){close();onClose?.();return;}
   const input=e.inputBuffer.getChannelData(0);
   // Devices may ignore the requested rate. Resample rather than mislabel PCM.
   const ratio=audio.sampleRate/24000,out=new Float32Array(Math.floor(input.length/ratio));
   for(let i=0;i<out.length;i++){const x=i*ratio,j=Math.floor(x),f=x-j;out[i]=input[j]*(1-f)+(input[Math.min(j+1,input.length-1)]||0)*f;}
   socket.send(JSON.stringify({type:'audio',data:pcmBase64(out)}));
  };
  source.connect(node);node.connect(gain);gain.connect(audio.destination);
  ping=setInterval(()=>{if(socket.readyState===1)socket.send(JSON.stringify({type:'ping'}));},4000);
  signal?.addEventListener('abort',close,{once:true});
  return {close};
 }catch(e){close();throw e;}
}
