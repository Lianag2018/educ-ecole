// Dormant integration seam. Not imported or shipped by the static client.
// Inject a Supabase client using a publishable key and a real parent Auth session.
// Never use Management tokens, service_role or secret keys with this adapter.
export function progressOnly(profile) {
  if (!['p1', 'p2'].includes(profile?.id)) throw Error('invalid_profile');
  const records = {};
  for (const [id, record] of Object.entries(profile.records || {})) {
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(id)) throw Error('invalid_record');
    if (!Number.isSafeInteger(record.streak) || record.streak < 0 ||
        !Number.isSafeInteger(record.attempts) || record.attempts < 0 ||
        !['correct', 'incorrect', 'help'].includes(record.result) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(record.due || '')) throw Error('invalid_record');
    Object.defineProperty(records, id, {enumerable: true, value: {
      streak: record.streak, attempts: record.attempts, result: record.result, due: record.due,
    }});
  }
  const progress = {calibrated: profile.calibrated === true, records};
  if (Buffer.byteLength(JSON.stringify(progress)) > 262144) throw Error('backup_too_large');
  return progress;
}
export function parentBackup(client) {
  async function identity() {
    const {data, error} = await client.auth.getUser();
    if (error || !data?.user?.id || !data.user.email_confirmed_at) throw Error('parent_auth_required');
    return data.user.id;
  }
  async function checked(query) {
    const {data, error} = await query;
    if (error) throw Error('backup_operation_failed');
    return data;
  }
  return {
    async save(profile, {consent = false} = {}) {
      if (!consent) throw Error('consent_required');
      const parent_id = await identity();
      return checked(client.from('famille_parent_backups').upsert({
        parent_id, profile_slot: profile.id, version: 1, progress: progressOnly(profile),
      }, {onConflict: 'parent_id,profile_slot'}));
    },
    async list() {
      const parentId = await identity();
      return checked(client.from('famille_parent_backups').select('profile_slot,version,progress').eq('parent_id', parentId));
    },
    async removeAll() {
      const parentId = await identity();
      return checked(client.from('famille_parent_backups').delete().eq('parent_id', parentId));
    },
    async signOut() {
      const {error} = await client.auth.signOut();
      if (error) throw Error('signout_failed');
    },
  };
}
