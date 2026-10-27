import {pathToFileURL} from 'node:url';
import {supabaseConfig} from './server/supabase-config.mjs';
import {ready} from './server/turn.mjs';

// Operator-only, read-only check. No upload, generation, migration or secret output.
// The integration's credentials stay in the Vercel server/build environment.
const model='gpt-4.1-mini-2025-04-14';
const familyUrl='https://legkfinwvtyavynngoea.supabase.co';
const origin='https://educ-ecole.vercel.app';
const project='prj_pxl5Jmoxwmgvtp9zDUXxvIGFFxo2';
const tables=['famille_voice_profiles','famille_voice_months','famille_voice_reservations','famille_school_plans'];
const rpcs=['famille_reserve_voice','famille_save_plan'];
const keyHeaders=key=>({apikey:key,...(/^sb_(secret|publishable)_/.test(key)?{}:{Authorization:'Bearer '+key})});
const failure=status=>status===401?'credentials_rejected':status===403?'permission_denied':status===404?'not_found':status===429?'rate_limited':'unavailable';

export async function checkConnections({env=process.env,fetcher=fetch,now=()=>new Date()}={}){
 const {url,key,anon}=supabaseConfig(env);
 let config;try{config=JSON.parse(env.EDUC_VOICE_CONFIG||'null');}catch{}
 const report={checkedAt:now().toISOString(),openai:'not_configured',supabase:'not_configured',tables:{},rpcMetadata:'not_checked',parent:'not_configured',privacyConfigured:ready(config),plansEnabled:config?.plansEnabled===true,photoWorkflowVerified:false};
 const request=async(url,headers={},method='GET')=>{
  try{return await fetcher(url,{method,headers,redirect:'error',signal:AbortSignal.timeout(10000)});}catch{return null;}
 };
 // Never send credentials to a URL supplied by a caller or another project.
 if(env.EDUC_ORIGIN!==origin||(url&&url!==familyUrl))return {...report,scope:'target_mismatch'};
 if(env.EDUC_OPENAI_API_KEY){
  const response=await request('https://api.openai.com/v1/models/'+model,{Authorization:'Bearer '+env.EDUC_OPENAI_API_KEY});
  if(response?.ok){
   try{report.openai=(await response.json()).id===model?'model_access_verified':'unexpected_response';}catch{report.openai='unexpected_response';}
  }else report.openai=response?failure(response.status):'unavailable';
 }
 if(url&&key&&anon){
  const health=await request(url+'/auth/v1/settings',keyHeaders(anon));
  report.supabase=health?.ok?'auth_reachable':health?failure(health.status):'unavailable';
  for(const table of tables){
   const response=await request(url+'/rest/v1/'+table+'?select=*&limit=0',keyHeaders(key),'HEAD');
   report.tables[table]=response?.ok?'readable':response?failure(response.status):'unavailable';
  }
  const schema=await request(url+'/rest/v1/',{...keyHeaders(key),Accept:'application/openapi+json'});
  if(schema?.ok){
   try{const paths=(await schema.json()).paths;report.rpcMetadata=rpcs.every(name=>paths?.['/rpc/'+name]?.post)?'present':'missing';}catch{report.rpcMetadata='unavailable';}
  }else report.rpcMetadata=schema?failure(schema.status):'unavailable';
  if(env.EDUC_PARENT_ID){
   if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(env.EDUC_PARENT_ID))report.parent='invalid_configuration';
   else{
    const response=await request(url+'/auth/v1/admin/users/'+env.EDUC_PARENT_ID,keyHeaders(key));
    if(response?.ok){try{const user=await response.json();report.parent=user.id===env.EDUC_PARENT_ID&&user.email_confirmed_at&&!user.is_anonymous?'confirmed_account':'account_unconfirmed';}catch{report.parent='unavailable';}}
    else report.parent=response?failure(response.status):'unavailable';
   }
  }
 }
 return report;
}

export async function checkProductionConnections(env=process.env,fetcher=fetch){
 // Previews and local builds neither inherit production secrets nor call providers.
 if(env.VERCEL_ENV!=='production'||env.VERCEL_GIT_COMMIT_REF!=='main'||env.VERCEL_PROJECT_ID!==project)return null;
 const report=await checkConnections({env,fetcher});
 console.log('EDUC_CONNECTION_CHECK '+JSON.stringify(report));
 return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const report=await checkConnections();
 console.log(JSON.stringify(report));
 if(report.openai!=='model_access_verified')process.exitCode=1;
}
