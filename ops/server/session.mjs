import {randomUUID} from 'node:crypto';
import {quote} from './budget.mjs';
import {tutorInstructions} from './provider.mjs';
export const unavailable = {status:503,body:{code:'voice_unavailable',message:'Le tutorat vocal est indisponible. Les exercices locaux restent accessibles.'}};
// Framework-neutral endpoint. Auth adapter must verify secure HttpOnly server session,
// CSRF, recent parent login, verified email and consent; never trust client claims.
export function createSessionEndpoint(deps={}) {
  return async request => {
    try {
      const parent=await deps.auth?.authenticateParent(request);
      if(!parent?.id || parent.role!=='parent' || !parent.emailVerified || !parent.recentLogin || !parent.csrfVerified) return {status:401,body:{code:'parent_login_required'}};
      if(request.method!=='POST') return {status:405,body:{code:'method_not_allowed'}};
      const profileId=request.body?.profileId;
      if(!['p1','p2'].includes(profileId) || Object.keys(request.body||{}).some(k=>k!=='profileId')) return {status:400,body:{code:'invalid_request'}};
      const profile=await deps.profiles?.ownedBy(parent.id,profileId);
      if(!profile) return {status:403,body:{code:'profile_forbidden'}};
      const c=deps.config;
      if(!c?.paidEnabled || !c.dedicatedHosting || !c.parentConsent || !c.childDataEligibilityReviewed || !c.zeroDataRetentionVerified || !c.endpointRetentionVerified || parent.email!=='danielgiroux007@gmail.com' || !c.alertEmailVerified) return unavailable;
      // Ephemeral Realtime credentials are replayable and session settings mutable.
      // No bounded-cost transport is implemented in this delivery. Refuse issuance
      // even with flags/keys until server-owned usage/revocation is integrated.
      if(!deps.transport?.enforcesHardCostBound || !deps.transport?.issueBoundedSession) return unavailable;
      const amount=quote(c.pricing,c.maximumSessionUsdMicros);
      const reservation=await deps.ledger.reserve({family:parent.id,month:new Date().toISOString().slice(0,7),id:randomUUID(),amount,config:c});
      // If issuance is ambiguous or fails, keep reservation for reconciliation.
      const token=await deps.transport.issueBoundedSession({reservation,provider:deps.provider,instructions:tutorInstructions(profile.schoolContext)});
      return {status:200,body:token};
    } catch { return unavailable; }
  };
}
