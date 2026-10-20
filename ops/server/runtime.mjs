import {createTurnEndpoint,ready,maximumUsd,TurnProvider} from './turn.mjs';
import {quote} from './budget.mjs';
// Server-only: no env value, provider error or request body is logged.
export function runtime(env=process.env,fetcher=fetch){
 let c;try{c=JSON.parse(env.EDUC_VOICE_CONFIG||'null');}catch{}
 const origin=env.EDUC_ORIGIN,url=env.EDUC_SUPABASE_URL,key=env.EDUC_SUPABASE_SERVICE_KEY,anon=env.EDUC_SUPABASE_ANON_KEY;
 const configured=()=>{try{return ready(c)&&/^https:\/\/[a-z0-9.-]+$/.test(origin)&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)&&key&&anon&&env.EDUC_PARENT_ID&&env.EDUC_OPENAI_API_KEY&&quote(c.pricing,maximumUsd(c))>0;}catch{return false;}};
 async function sb(path,body,token=key){const r=await fetcher(url+path,{method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(10000),headers:{apikey:body&&path.includes('/token')?anon:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok){if(path==='/rest/v1/rpc/famille_reserve_voice'){const e=await r.json().catch(()=>null);if(e?.message==='rate_limit')throw Error('rate_limit');}throw Error('backend_unavailable');}return r.json();}
 const auth={async authenticateParent(req){
  if(!configured()||req.headers.origin!==origin)return null;
  const token=(req.headers.cookie||'').match(/(?:^|; )educ_parent=([^;]+)/)?.[1];if(!token)return null;
  const u=await sb('/auth/v1/user',null,token);
  // Supabase validates JWT signature, expiry and user before claims are read.
  const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());
  const now=Date.now()/1000;if(u.id!==env.EDUC_PARENT_ID||!u.email_confirmed_at||!Number.isFinite(claims.iat)||claims.iat>now+30||now-claims.iat>3600||u.is_anonymous)return null;
  return {id:u.id,role:'parent',emailVerified:true,recentLogin:true,csrfVerified:true};
 }};
 const profiles={async ownedBy(parent,slot){const rows=await sb(`/rest/v1/famille_voice_profiles?parent_id=eq.${encodeURIComponent(parent)}&profile_slot=eq.${slot}&select=stage,focus,assignments`);return rows[0];}};
 const ledger={durable:true,async reserve({family,profileId,id,amount,otherCostsMicros}){
  try{return await sb('/rest/v1/rpc/famille_reserve_voice',{p_parent:family,p_slot:profileId,p_id:id,p_amount:amount,p_other:otherCostsMicros});}catch(e){throw Error(e.message==='rate_limit'?'rate_limit':'budget_unavailable');}
 }};
 const turn=createTurnEndpoint({auth,profiles,config:c,ledger,provider:new TurnProvider({apiKey:env.EDUC_OPENAI_API_KEY,fetchImpl:fetcher})});
 return async req=>{
  if(req.path==='/api/voice/status')return {status:200,body:{available:Boolean(configured()),authenticated:Boolean(await auth.authenticateParent(req)),message:'Activation requise : compte parent, confidentialité, budget durable et clé serveur.'}};
  if(req.path==='/api/parent/logout'&&req.method==='POST'&&req.headers.origin===origin)return {status:200,headers:{'Set-Cookie':'educ_parent=; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=0'},body:{ok:true}};
  if(req.path==='/api/parent/login'){
   if(!configured())return {status:503,body:{code:'voice_unavailable'}};
   if(req.method!=='POST'||req.headers.origin!==origin)return {status:403,body:{code:'origin_required'}};
   const b=req.body;if(typeof b?.email!=='string'||b.email.length>254||typeof b.password!=='string'||b.password.length>256)return {status:400,body:{code:'invalid_request'}};
   try{const data=await sb('/auth/v1/token?grant_type=password',{email:b.email,password:b.password});if(data.user?.id!==env.EDUC_PARENT_ID||!data.user.email_confirmed_at)throw Error('denied');return {status:200,headers:{'Set-Cookie':`educ_parent=${data.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=3600`},body:{ok:true}};}catch{return {status:401,body:{code:'login_failed'}};}
  }
  if(req.path==='/api/voice/turn')return turn(req);
  return {status:404,body:{code:'not_found'}};
 };
}
