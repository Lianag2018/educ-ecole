import {createHmac,timingSafeEqual} from 'node:crypto';
import {validatePlan} from '../../src/school-plan.js';
const signature=(key,payload)=>createHmac('sha256',key).update('educ-plan-approval-v1\0'+payload).digest();
export function issuePlanDraft({key,parent,profile,digest,plan,now=Date.now()}){
 if(!key)throw Error('plan_unavailable');
 const payload=Buffer.from(JSON.stringify({parent,profile,digest,plan:validatePlan(plan),expires:now+30*60*1000})).toString('base64url');
 return payload+'.'+signature(key,payload).toString('base64url');
}
export function readPlanDraft({key,token,parent,profile,grade,now=Date.now()}){
 if(!key||typeof token!=='string'||token.length>50000)throw Error('draft_invalid');
 const parts=token.split('.');if(parts.length!==2||!parts.every(x=>/^[A-Za-z0-9_-]+$/.test(x)))throw Error('draft_invalid');
 const actual=Buffer.from(parts[1],'base64url'),expected=signature(key,parts[0]);
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error('draft_invalid');
 const data=JSON.parse(Buffer.from(parts[0],'base64url').toString());
 if(data.parent!==parent||data.profile!==profile||!Number.isFinite(data.expires)||data.expires<=now||data.expires>now+30*60*1000||!/^[a-f0-9]{64}$/.test(data.digest))throw Error('draft_invalid');
 const plan=validatePlan(data.plan);
 if(plan.profileId!==profile||plan.grade!==grade)throw Error('draft_invalid');
 return {...data,plan};
}
