import {randomUUID} from 'node:crypto';
import {sealTicket} from './ticket.mjs';
import {supabaseConfig} from '../server/supabase-config.mjs';
import {createSupabaseClient} from '../server/supabase-client.mjs';
import {quote} from '../server/budget.mjs';
import {GROK_RELAY,GROK_MAX_USD_MICROS} from '../server/grok-live.mjs';
// Explicitly opt-in, one selected production SHA. Never use child audio or print
// credentials, bodies or upstream errors. One budgeted connection; no retry.
export async function probeProductionGrok(env=process.env){
 if(env.VERCEL_ENV!=='production'||env.VERCEL_GIT_COMMIT_REF!=='main'||env.VERCEL_PROJECT_ID!=='prj_pxl5Jmoxwmgvtp9zDUXxvIGFFxo2'||!env.EDUC_GROK_PROBE_SHA||env.EDUC_GROK_PROBE_SHA!==env.VERCEL_GIT_COMMIT_SHA)return;
 let stage='configuration';
 try{
  const c=JSON.parse(env.EDUC_GROK_CONFIG),db=supabaseConfig(env);
  if(db.url!=='https://legkfinwvtyavynngoea.supabase.co'||env.EDUC_ORIGIN!=='https://educ-ecole.vercel.app')throw Error();
  const sb=createSupabaseClient({...db});const id=randomUUID();stage='budget';
  await sb('/rest/v1/rpc/famille_reserve_voice',{p_parent:env.EDUC_PARENT_ID,p_slot:'p1',p_id:id,p_amount:quote(c.pricing,GROK_MAX_USD_MICROS),p_other:c.otherCostsMicros});
  stage='xai_token';const r=await fetch('https://api.x.ai/v1/realtime/client_secrets',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:'Bearer '+env.EDUC_XAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({expires_after:{seconds:60}})});
  if(!r.ok)throw Error();const s=await r.json();if(!s.value)throw Error();
  const ticket=await sealTicket({version:1,id,parent:env.EDUC_PARENT_ID,slot:'p1',credential:s.value,instructions:'Test automatisé sans utilisateur. Dis seulement : Bonjour, le test de connexion est terminé.',durationSeconds:120,expiresAt:Date.now()+45000},env.SUPABASE_SERVICE_ROLE_KEY);
  stage='relay_handshake';
  await new Promise((resolve,reject)=>{
   const socket=new WebSocket(GROK_RELAY);let success=false;
   const timeout=setTimeout(()=>{socket.close();reject(Error());},15000);
   socket.onopen=()=>socket.send(JSON.stringify({type:'authenticate',ticket}));
   socket.onmessage=e=>{try{if(JSON.parse(e.data).type==='audio'&&typeof JSON.parse(e.data).data==='string'&&JSON.parse(e.data).data.length>16){success=true;clearTimeout(timeout);socket.send(JSON.stringify({type:'stop'}));socket.close();resolve();}}catch{}};
   socket.onerror=socket.onclose=()=>{clearTimeout(timeout);if(!success)reject(Error());};
  });
  console.log('EDUC_GROK_PROBE '+JSON.stringify({ok:true,stage:'upstream_audio_received',audioSent:false,audioReceived:true,sha:env.VERCEL_GIT_COMMIT_SHA}));
 }catch{console.log('EDUC_GROK_PROBE '+JSON.stringify({ok:false,stage,audioSent:false}));throw Error('grok_probe_failed_'+stage);}
}
