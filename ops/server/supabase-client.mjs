// Server-only HTTP adapter. Never log response bodies or credentials here.
// Only the reviewed budget RPC returns SQL void (PostgREST: HTTP 204).
const VOID_BUDGET_RPC = '/rest/v1/rpc/famille_reserve_voice';

export function createSupabaseClient({url, key, anon, fetcher = fetch}) {
  return async function sb(path, body, token) {
    const method = body ? 'POST' : 'GET';
    const publicAuth = path === '/auth/v1/token?grant_type=password' || path === '/auth/v1/user';
    const apiKey = publicAuth ? anon : key;
    // New API keys are opaque, not JWTs. Only real user tokens or legacy JWT
    // keys belong in Authorization; password login uses the public key only.
    const bearer = token ?? apiKey;
    const headers = {apikey: apiKey, 'Content-Type': 'application/json'};
    if (bearer && !/^sb_(secret|publishable)_/.test(bearer)) headers.Authorization = `Bearer ${bearer}`;
    const response = await fetcher(url + path, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
      headers,
      ...(body ? {body: JSON.stringify(body)} : {}),
    });
    if (!response.ok) {
      if (path === VOID_BUDGET_RPC) {
        const error = await response.json().catch(() => null);
        if (error?.message === 'rate_limit') throw Error('rate_limit');
      }
      throw Error('backend_unavailable');
    }
    // A successful void RPC has already committed the reservation. Parsing its
    // empty body as JSON incorrectly reports a failure after charging the ledger.
    // Do not generalize this exception to auth, profile reads or JSON-returning RPCs.
    if (method === 'POST' && path === VOID_BUDGET_RPC && response.status === 204) return null;
    try { return await response.json(); }
    catch { throw Error('backend_unavailable'); }
  };
}
