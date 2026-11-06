import {openTicket} from './ticket.mjs';
import {bridge} from './relay.mjs';
const origin='https://educ-ecole.vercel.app';
Deno.serve(req=>{
 if(req.method==='GET'&&new URL(req.url).pathname.endsWith('/health'))return Response.json({relay:'educ-grok-v2',durationSeconds:120});
 if((req.headers.get('origin')!==null&&req.headers.get('origin')!==origin)||req.headers.get('upgrade')?.toLowerCase()!=='websocket')return new Response(null,{status:403});
 const {socket,response}=Deno.upgradeWebSocket(req);let started=false,closed=false;
 // Keep the worker alive after the HTTP upgrade; resolve on actual socket close.
 const lifetime=new Promise<void>(resolve=>socket.addEventListener('close',()=>resolve(),{once:true}));
 EdgeRuntime.waitUntil(lifetime);
 const timer=setTimeout(()=>{closed=true;try{socket.close(1008,'unauthorized');}catch{}},5000);
 socket.onclose=socket.onerror=()=>{closed=true;clearTimeout(timer);};
 socket.onmessage=async e=>{
  if(started||closed)return;started=true;
  try{
   if(typeof e.data!=='string'||e.data.length>22000)throw Error();
   const message=JSON.parse(e.data);if(message.type!=='authenticate')throw Error();
   const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
   const ticket=await openTicket(message.ticket,key);
   const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/famille_consume_grok_ticket',{method:'POST',redirect:'error',signal:AbortSignal.timeout(4000),headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({p_id:ticket.id,p_parent:ticket.parent})});
   if(!r.ok||await r.json()!==true||closed)throw Error();
   const upstream=new WebSocket('wss://api.x.ai/v1/realtime?model=grok-voice-latest',['xai-client-secret.'+ticket.credential]);
   clearTimeout(timer);bridge({client:socket,upstream,ticket});
  }catch{closed=true;clearTimeout(timer);try{socket.close(1008,'unavailable');}catch{}}
 };
 return response;
});
