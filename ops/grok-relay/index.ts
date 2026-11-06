import {openTicket} from './ticket.mjs';
import {bridge} from './relay.mjs';
const origin='https://educ-ecole.vercel.app';
Deno.serve(req=>{
 if(req.method==='GET'&&new URL(req.url).pathname.endsWith('/health'))return Response.json({relay:'educ-grok-v3',durationSeconds:120});
 if((req.headers.get('origin')!==null&&req.headers.get('origin')!==origin)||req.headers.get('upgrade')?.toLowerCase()!=='websocket')return new Response(null,{status:403});
 const {socket,response}=Deno.upgradeWebSocket(req);let started=false,closed=false;
 // Keep the worker alive after the HTTP upgrade; resolve on actual socket close.
 const lifetime=new Promise<void>(resolve=>socket.addEventListener('close',()=>resolve(),{once:true}));
 EdgeRuntime.waitUntil(lifetime);
 const timer=setTimeout(()=>{closed=true;try{socket.close(1008,'unauthorized');}catch{}},5000);
 socket.onclose=socket.onerror=()=>{closed=true;clearTimeout(timer);};
 socket.onmessage=async e=>{
  if(started||closed)return;started=true;let phase='ticket';
  try{
   if(typeof e.data!=='string'||e.data.length>22000)throw Error();
   const message=JSON.parse(e.data);if(message.type!=='authenticate')throw Error();
   phase='relay_key';
   const key=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
   const keyResponse=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/famille_grok_relay_key',{method:'POST',redirect:'error',signal:AbortSignal.timeout(4000),headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:'{}'});
   if(!keyResponse.ok)throw Error();
   const ticketKey=await keyResponse.json();phase='ticket';
   const ticket=await openTicket(message.ticket,ticketKey);
   phase='reservation';const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/famille_consume_grok_ticket',{method:'POST',redirect:'error',signal:AbortSignal.timeout(4000),headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({p_id:ticket.id,p_parent:ticket.parent})});
   if(!r.ok||await r.json()!==true||closed)throw Error();
   phase='upstream';const upstream=new WebSocket('wss://api.x.ai/v1/realtime?model=grok-voice-latest',['xai-client-secret.'+ticket.credential]);
   clearTimeout(timer);bridge({client:socket,upstream,ticket,onDiagnostic:status=>console.log('EDUC_GROK_RELAY '+JSON.stringify(status))});
  }catch(error){const code=['ticket_decrypt_failed','ticket_payload_invalid','invalid_ticket','relay_key_missing'].includes(error?.message)?error.message:'other';console.log('EDUC_GROK_RELAY '+JSON.stringify({reason:'authentication_failed',phase,code}));closed=true;clearTimeout(timer);try{socket.close(1008,'unavailable');}catch{}}
 };
 return response;
});
