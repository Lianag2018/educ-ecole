import {timingSafeEqual} from 'node:crypto';
import {cookie,digest} from './family-device.mjs';
import {supabaseConfig} from './supabase-config.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const failure=(status,code)=>({status,body:{code}});

// Operational provisioning is disabled unless an operator deliberately supplies
// a short-lived secret AND the recipient in the private production environment.
// It returns a Supabase invitation for private delivery to that same recipient,
// never provider keys. Each operator credential can be used only once.
export async function provisionParent(req,{env,sb,now=Date.now}){
 if(req.method!=='POST'||req.headers.origin!==env.EDUC_ORIGIN)return failure(403,'origin_required');
 const secret=env.EDUC_PARENT_SETUP_TOKEN,provided=req.headers.authorization?.replace(/^Bearer /,'');
 const until=Date.parse(env.EDUC_PARENT_SETUP_EXPIRES||'');
 if(env.VERCEL_ENV!=='production'||env.VERCEL_PROJECT_ID!=='prj_pxl5Jmoxwmgvtp9zDUXxvIGFFxo2'||env.EDUC_ORIGIN!=='https://educ-ecole.vercel.app'||supabaseConfig(env).url!=='https://legkfinwvtyavynngoea.supabase.co'||
    !/^[A-Za-z0-9_-]{43}$/.test(secret||'')||!/^[A-Za-z0-9_-]{43}$/.test(provided||'')||provided.length!==secret.length||!timingSafeEqual(Buffer.from(provided),Buffer.from(secret))||
    !Number.isFinite(until)||until<=now()||until-now()>3600000)return failure(404,'not_found');
 const email=env.EDUC_PARENT_SETUP_EMAIL;
 if(!email||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||Object.keys(req.body||{}).length)return failure(400,'invalid_request');
 try{
  if(!await sb('/rest/v1/rpc/famille_claim_parent_setup',{p_digest:digest(secret)}))return failure(409,'setup_already_used');
  // No arbitrary email from a request. Never reset an existing verified parent.
  const listing=await sb('/auth/v1/admin/users?page=1&per_page=1000');
  if(!Array.isArray(listing.users)||listing.users.length>=1000)throw Error('setup_unavailable');
  const existing=listing.users.find(u=>u.email?.toLowerCase()===email.toLowerCase());
  if(existing?.email_confirmed_at){
   if(!uuid.test(existing.id)||existing.is_anonymous)throw Error('setup_unavailable');
   return {status:200,body:{parentId:existing.id,alreadyConfirmed:true}};
  }
  const result=await sb('/auth/v1/admin/generate_link',{type:'invite',email});
  if(!uuid.test(result.id)||result.email?.toLowerCase()!==email.toLowerCase()||result.verification_type!=='invite'||!/^[a-f0-9]{32,128}$/i.test(result.hashed_token||''))throw Error('setup_unavailable');
  return {status:200,body:{parentId:result.id,activationUrl:env.EDUC_ORIGIN+'/activation.html#token='+result.hashed_token}};
 }catch{return failure(503,'setup_unavailable');}
}

export async function activateParent(req,{env,sb,device}){
 if(req.method!=='POST'||req.headers.origin!==env.EDUC_ORIGIN)return failure(403,'origin_required');
 const b=req.body;
 if(!env.EDUC_PARENT_ID)return failure(503,'parent_setup_required');
 if(!b||Object.keys(b).some(k=>!['tokenHash','password','rememberDevice'].includes(k))||
    !/^[a-f0-9]{32,128}$/i.test(b.tokenHash||'')||typeof b.password!=='string'||b.password.length<12||b.password.length>256||
    (b.rememberDevice!==undefined&&typeof b.rememberDevice!=='boolean'))return failure(400,'invalid_request');
 try{
  const pending=(req.headers.cookie||'').match(/(?:^|;\s*)educ_activation=([A-Za-z0-9_.-]+)/)?.[1];
  let data;
  if(pending){
   const user=await sb('/auth/v1/user',null,pending);
   const issued=JSON.parse(Buffer.from(pending.split('.')[1],'base64url')).iat;
   if(!Number.isFinite(issued)||issued>Date.now()/1000+30||Date.now()/1000-issued>600)return failure(401,'activation_failed');
   data={user,access_token:pending};
  }else data=await sb('/auth/v1/verify',{type:'invite',token_hash:b.tokenHash});
  if(data.user?.id!==env.EDUC_PARENT_ID||!data.user.email_confirmed_at||data.user.is_anonymous||typeof data.access_token!=='string')return failure(403,'parent_forbidden');
  try{await sb('/auth/v1/user',{password:b.password},data.access_token,{method:'PUT'});}
  catch{return {status:422,headers:{'Set-Cookie':cookie('educ_activation',data.access_token,600)},body:{code:'password_rejected'}};}
  const cookies=[cookie('educ_parent',data.access_token,3600),cookie('educ_activation','',0)];let deviceEnabled=false;
  if(b.rememberDevice===true){try{cookies.push(await device.enable(req));deviceEnabled=true;}catch{}}
  return {status:200,headers:{'Set-Cookie':cookies},body:{ok:true,deviceEnabled}};
 }catch{return failure(401,'activation_failed');}
}
