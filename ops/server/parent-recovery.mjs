import {cookie} from './family-device.mjs';
const fail=(status,code)=>({status,body:{code}});
const accepted=()=>({status:200,body:{ok:true}});
// Supabase sends and verifies the one-use recovery link. No admin password reset.
export async function recoverParent(req,{env,sb,now=Date.now}){
 if(req.method!=='POST'||!env.EDUC_ORIGIN||req.headers.origin!==env.EDUC_ORIGIN)return fail(403,'origin_required');
 if(!env.EDUC_PARENT_ID)return fail(503,'recovery_unavailable');
 const b=req.body;
 if(req.path==='/api/parent/recover'){
  if(!b||Object.keys(b).some(k=>k!=='email')||typeof b.email!=='string'||b.email.length>254||!/^\S+@\S+\.\S+$/.test(b.email.trim()))return fail(400,'invalid_request');
  try{
   const parent=await sb('/auth/v1/admin/users/'+encodeURIComponent(env.EDUC_PARENT_ID));
   // Do not disclose whether an address belongs to this household.
   if(!parent.email_confirmed_at||parent.is_anonymous||parent.email?.toLowerCase()!==b.email.trim().toLowerCase())return accepted();
   await sb('/auth/v1/recover?redirect_to='+encodeURIComponent(env.EDUC_ORIGIN+'/recovery.html'),{email:parent.email});
   return accepted();
  }catch(e){return e.message==='recovery_rate_limited'?fail(429,'recovery_rate_limited'):fail(503,'recovery_unavailable');}
 }
 if(req.path!=='/api/parent/reset-password')return fail(404,'not_found');
 if(!b||Object.keys(b).some(k=>!['accessToken','password'].includes(k))||typeof b.accessToken!=='string'||b.accessToken.length>8192||!/^[-\w]+\.[-\w]+\.[-\w]+$/.test(b.accessToken)||typeof b.password!=='string'||b.password.length<12||b.password.length>256)return fail(400,'invalid_request');
 try{
  const user=await sb('/auth/v1/user',null,b.accessToken);
  if(user.id!==env.EDUC_PARENT_ID||!user.email_confirmed_at||user.is_anonymous)return fail(403,'parent_forbidden');
  // Parse claims only after the provider has verified the actual token.
  const claims=JSON.parse(Buffer.from(b.accessToken.split('.')[1],'base64url'));
  if(!Number.isFinite(claims.iat)||claims.iat>now()/1000+30||now()/1000-claims.iat>600)return fail(401,'recovery_expired');
  try{await sb('/auth/v1/user',{password:b.password},b.accessToken,{method:'PUT'});}catch{return fail(422,'password_rejected');}
  return {status:200,headers:{'Set-Cookie':cookie('educ_parent',b.accessToken,3600)},body:{ok:true}};
 }catch{return fail(401,'recovery_expired');}
}
