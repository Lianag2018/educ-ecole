// No logging, transcripts, retries, tools, browser-selected URLs or model settings.
// A session.update followed immediately by response.create produces no audio:
// server VAD waits for a turn. The server alone inserts one fixed text turn.
const GREETING='Commence maintenant par la courte salutation prévue, puis attends.';
export function bridge({client,upstream,ticket,now=Date.now,setTimer=setTimeout,clearTimer=clearTimeout,onDiagnostic=()=>{}}){
 let closed=false,ready=false,configured='idle';const timers=[];let bytes=0,windowStart=now(),lastPing=now();
 const close=(reason='session_ended')=>{if(closed)return;closed=true;onDiagnostic({reason,configured,ready});for(const t of timers)clearTimer(t);for(const ws of [client,upstream])try{ws.close(1000,'session_ended');}catch{}};
 const send=(ws,message)=>{if(!closed&&ws.readyState===1){if(ws.bufferedAmount>256000)return close();ws.send(JSON.stringify(message));}};
 timers.push(setTimer(close,120000));
 const heartbeat=()=>{if(closed)return;if(now()-lastPing>15000)return close();timers.push(setTimer(heartbeat,5000));};heartbeat();
 const connectTimeout=setTimer(close,10000);timers.push(connectTimeout);
 client.onclose=()=>close('client_closed');client.onerror=()=>close('client_error');upstream.onclose=()=>close('upstream_closed');upstream.onerror=()=>close('upstream_error');
 const sessionUpdate=()=>send(upstream,{type:'session.update',session:{voice:'eve',instructions:ticket.instructions,tools:[],turn_detection:{type:'server_vad'},audio:{input:{format:{type:'audio/pcm',rate:24000}},output:{format:{type:'audio/pcm',rate:24000}}}}});
 upstream.onopen=()=>{
  if(closed){try{upstream.close();}catch{}return;}
 };
 upstream.onmessage=e=>{
  if(closed||typeof e.data!=='string'||e.data.length>200000)return close();
  let m;try{m=JSON.parse(e.data);}catch{return close();}
  if(m.type==='error')return close('provider_error');
  if((m.type==='session.created'||m.type==='conversation.created')&&configured==='idle'){configured='sent';sessionUpdate();return;}
  if(m.type==='session.updated'&&configured==='sent'){
   configured='acked';
   send(upstream,{type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text:GREETING}]}});
   return;
  }
  if(['conversation.item.added','conversation.item.created'].includes(m.type)&&configured==='acked'&&!ready){
   ready=true;clearTimer(connectTimeout);send(client,{type:'ready'});send(upstream,{type:'response.create'});return;
  }
  if(!ready)return;
  if(['response.output_audio.delta','response.audio.delta'].includes(m.type)&&typeof m.delta==='string')send(client,{type:'audio',data:m.delta});
  if(m.type==='input_audio_buffer.speech_started')send(client,{type:'interrupt'});
 };
 client.onmessage=e=>{
  if(closed||typeof e.data!=='string'||e.data.length>20000)return close();
  let m;try{m=JSON.parse(e.data);}catch{return close();}
  if(m.type==='stop')return close();
  if(m.type==='ping'){lastPing=now();return;}
  if(!ready||m.type!=='audio'||typeof m.data!=='string'||!m.data.length||m.data.length>16384||m.data.length%4||!/^[A-Za-z0-9+/]+={0,2}$/.test(m.data))return close();
  if(now()-windowStart>=1000){windowStart=now();bytes=0;}bytes+=m.data.length;
  if(bytes>100000)return close();
  send(upstream,{type:'input_audio_buffer.append',audio:m.data});
 };
 return {close};
}
