import {createPublicKey,verify} from 'node:crypto';
const issuer='https://token.actions.githubusercontent.com';
export const JOB_AUDIENCE='https://educ-ecole.vercel.app/api/learning/run';
export function githubJobVerifier({fetcher=fetch,now=()=>Date.now()}={}){
 let keys,expires=0;
 return async req=>{
  try{
   const token=req.headers?.authorization?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
   if(!token||token.length>16000)return false;
   const parts=token.split('.');if(parts.length!==3)return false;
   const header=JSON.parse(Buffer.from(parts[0],'base64url')),claims=JSON.parse(Buffer.from(parts[1],'base64url')),t=now()/1000;
   if(header.alg!=='RS256'||typeof header.kid!=='string'||header.crit||claims.iss!==issuer||claims.aud!==JOB_AUDIENCE||
      claims.repository_id!=='1427486942'||claims.repository_owner_id!=='242254026'||claims.repository!=='Lianag2018/educ-ecole'||
      claims.ref!=='refs/heads/main'||claims.workflow_ref!=='Lianag2018/educ-ecole/.github/workflows/educ-evolution.yml@refs/heads/main'||
      !['schedule','workflow_dispatch'].includes(claims.event_name)||
      ![claims.iat,claims.nbf,claims.exp].every(Number.isFinite)||claims.iat>t+30||claims.nbf>t+30||claims.exp<=t||t-claims.iat>600||claims.exp-claims.iat>600)return false;
   if(!keys||expires<now()){
    const r=await fetcher(issuer+'/.well-known/jwks',{redirect:'error',signal:AbortSignal.timeout(5000)});
    if(!r.ok)return false;keys=(await r.json()).keys;expires=now()+300000;
   }
   const key=keys.find(k=>k.kid===header.kid&&k.kty==='RSA'&&k.use==='sig'&&k.alg==='RS256');
   return !!key&&verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey({key,format:'jwk'}),Buffer.from(parts[2],'base64url'));
  }catch{return false;}
 };
}
