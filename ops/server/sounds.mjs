// Sons de la famille : le parent connecté ÉCRIT (référence), le parent ou une tablette autorisée de la famille LIT.
// Rien n'est public : accès seulement avec le cookie parent ou celui de l'appareil familial, même origine exigée.
const ID=/^[a-z][a-z-]{0,15}$/;
export const MAX_SOUND_BYTES=400000,MAX_SOUND_CHARS=Math.ceil(MAX_SOUND_BYTES/3)*4,MIN_SOUND_BYTES=500,MAX_SOUNDS=120;
const B64=/^[A-Za-z0-9+/]+={0,2}$/;
const ROUTES=['/api/sounds/list','/api/sounds/get','/api/sounds/put','/api/sounds/delete','/api/sounds/settings'];
export const validSoundData=t=>{if(typeof t!=='string'||t.length>MAX_SOUND_CHARS||t.length%4!==0||!B64.test(t))return false;const n=Buffer.from(t,'base64').length;return n>MIN_SOUND_BYTES&&n<=MAX_SOUND_BYTES;};
export function soundsEndpoint({auth,store,origin}){
 return async req=>{
  try{
   if(!ROUTES.includes(req.path))return {status:404,body:{code:'not_found'}};
   if(req.method!=='POST')return {status:405,body:{code:'method_not_allowed'}};
   if(req.headers?.origin!==origin)return {status:403,body:{code:'origin_required'}};
   const write=!['/api/sounds/list','/api/sounds/get'].includes(req.path);
   let who=null;try{who=await (write?auth.authenticateParent(req):auth.authenticateLearner(req));}catch{}
   if(!who?.id||(write&&who.role!=='parent'))return {status:401,body:{code:'parent_login_required'}};
   const b=req.body||{},keys=Object.keys(b);
   if(req.path==='/api/sounds/list')return {status:200,body:{sounds:await store.list(who.id),ms:await store.settings(who.id)}};
   if(req.path==='/api/sounds/settings'){
    const ms=b.ms;if(keys.some(k=>k!=='ms')||!ms||typeof ms!=='object'||Array.isArray(ms)||Object.keys(ms).length>MAX_SOUNDS)throw Error('invalid');
    const clean={};for(const [k,v] of Object.entries(ms)){if(!ID.test(k)||!Number.isFinite(v)||v<300||v>2000)throw Error('invalid');clean[k]=Math.round(v);}
    await store.saveSettings(who.id,clean);return {status:200,body:{ok:true}};
   }
   if(typeof b.id!=='string'||!ID.test(b.id))throw Error('invalid');
   if(req.path==='/api/sounds/get'){
    if(keys.some(k=>k!=='id'))throw Error('invalid');
    const row=await store.get(who.id,b.id);return row?{status:200,body:{audio:row.audio,updatedAt:row.updatedAt}}:{status:404,body:{code:'not_found'}};
   }
   if(req.path==='/api/sounds/delete'){if(keys.some(k=>k!=='id'))throw Error('invalid');await store.remove(who.id,b.id);return {status:200,body:{ok:true}};}
   if(keys.some(k=>!['id','audio'].includes(k))||!validSoundData(b.audio))throw Error('invalid');
   const updatedAt=await store.put(who.id,b.id,b.audio);
   return {status:200,body:{ok:true,updatedAt}};
  }catch(e){return e.message==='invalid'?{status:400,body:{code:'invalid_request'}}:{status:503,body:{code:'sounds_unavailable'}};}
 };
}
