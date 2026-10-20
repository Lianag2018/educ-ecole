import {pathToFileURL} from 'node:url';
import {api, requireValue, neutralError} from './http.mjs';

export async function auditSupabase({token, ref, fetcher}) {
  requireValue(/^[a-z0-9]{20}$/.test(ref || ''), 'project_ref_required');
  const request = api('https://api.supabase.com', token, fetcher);
  // Project Settings Read suffices; no account-wide enumeration or key endpoint.
  const project = await request(`/v1/projects/${ref}`);
  requireValue(project.id === ref && project.name === "danielgiroux007@gmail.com's Project", 'project_identity_mismatch');
  requireValue(typeof project.organization_id === 'string', 'organization_metadata_missing');
  // Only metadata explicitly allowed for review; this does not verify account identity.
  return {
    project_ref: ref, name: "danielgiroux007@gmail.com's Project",
    organization_id: project.organization_id,
    region: project.region, status: project.status,
    identity_confirmed: false, migration_allowed: false,
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  auditSupabase({token: process.env.EDUC_ECOLE_SUPABASE, ref: process.env.EDUC_SUPABASE_PROJECT_REF})
    .then(result => console.log(JSON.stringify(result))).catch(neutralError);
}
