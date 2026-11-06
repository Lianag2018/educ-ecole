// Opaque Supabase API keys belong in apikey, never in a JWT Authorization header.
export function serviceHeaders(key){
 if(typeof key!=='string'||key.length<32)throw Error('relay_key_missing');
 return {apikey:key,'Content-Type':'application/json',...(!key.startsWith('sb_secret_')?{Authorization:'Bearer '+key}:{})};
}
