// Separate from OpenAI eligibility/configuration. A key alone never enables audio.
export function grokReadiness({apiKey,config}={}){
 const missing=[];
 if(!apiKey)missing.push('server_key');
 if(!config?.voiceAccessVerified)missing.push('voice_access');
 if(!config?.childDataEligibilityReviewed||!config?.endpointRetentionReviewed)missing.push('provider_review');
 if(!config?.adultTrialPassed)missing.push('adult_trial');
 // This implementation has no production relay. A flag cannot substitute for it.
 missing.push('bounded_transport');
 return {available:missing.length===0,missing};
}
export function createGrokEndpoints({auth,apiKey,config}={}){
 return async req=>{
  if(req.method!=='POST')return {status:405,body:{code:'method_not_allowed'}};
  let parent;try{parent=await auth?.authenticateParent(req);}catch{}
  const authenticated=Boolean(parent?.id&&parent.role==='parent'&&parent.emailVerified&&parent.recentLogin&&parent.csrfVerified);
  const state=grokReadiness({apiKey,config});
  if(req.path.endsWith('/status'))return {status:200,body:{available:state.available,authenticated,...(authenticated?{missing:state.missing}:{})}};
  if(!authenticated)return {status:401,body:{code:'parent_login_required'}};
  // No durable, server-owned relay is installed yet. Never mint an unbounded
  // browser credential, even if configuration flags are accidentally switched on.
  return {status:503,body:{code:'grok_live_unavailable'}};
 };
}
