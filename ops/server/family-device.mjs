import {createHash,randomBytes} from 'node:crypto';
export const DEVICE_SECONDS=90*24*60*60;
export const cookie=(name,value,seconds)=>`${name}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=${seconds}`;
const readCookie=(req,name)=>(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);
export const digest=value=>createHash('sha256').update(value).digest('hex');

// A family device is NOT a parent session. Its authority is limited at each
// caller to structured progress and already analysed plans; never paid imports.
export function familyDevice({sb,parentId,origin}){
 const readToken=req=>{const value=readCookie(req,'educ_device');return /^[A-Za-z0-9_-]{43}$/.test(value||'')?value:null;};
 return {
  async enable(req){
   const token=randomBytes(32).toString('base64url'),old=readToken(req);
   await sb('/rest/v1/rpc/famille_register_device',{p_parent:parentId,p_digest:digest(token),p_previous:old?digest(old):null});
   return cookie('educ_device',token,DEVICE_SECONDS);
  },
  async authenticate(req){
   if(!parentId||req.headers.origin!==origin)return null;
   const token=readToken(req);if(!token)return null;
   const rows=await sb(`/rest/v1/famille_devices?parent_id=eq.${encodeURIComponent(parentId)}&token_hash=eq.${digest(token)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=parent_id&limit=1`);
   return rows.length===1?{id:parentId,role:'family_device',csrfVerified:true}:null;
  },
  async revoke(req,all=false){
   const token=readToken(req);
   if(all||token)await sb('/rest/v1/rpc/famille_revoke_devices',{p_parent:parentId,p_digest:all?null:digest(token)});
   return cookie('educ_device','',0);
  }
 };
}
