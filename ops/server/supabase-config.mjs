// Server-only. Select a whole configuration family; never mix projects/keys.
export function supabaseConfig(env) {
  const explicit = ['EDUC_SUPABASE_URL', 'EDUC_SUPABASE_SERVICE_KEY', 'EDUC_SUPABASE_ANON_KEY'];
  if (explicit.some(name => env[name] !== undefined)) {
    return {url: env.EDUC_SUPABASE_URL, key: env.EDUC_SUPABASE_SERVICE_KEY, anon: env.EDUC_SUPABASE_ANON_KEY};
  }
  const modern = ['SUPABASE_SECRET_KEY', 'SUPABASE_PUBLISHABLE_KEY'];
  if (modern.some(name => env[name] !== undefined)) {
    return {url: env.SUPABASE_URL, key: env.SUPABASE_SECRET_KEY, anon: env.SUPABASE_PUBLISHABLE_KEY};
  }
  return {url: env.SUPABASE_URL, key: env.SUPABASE_SERVICE_ROLE_KEY, anon: env.SUPABASE_ANON_KEY};
}
