// Never surface remote error messages, headers, bodies or request credentials.
export class AuditError extends Error {}
export function requireValue(condition, code) {
  if (!condition) throw new AuditError(code);
}
export function api(origin, token, fetcher = fetch) {
  requireValue(typeof token === 'string' && token.length > 0, 'token_missing');
  return async (path, {method = 'GET', body, allow404 = false} = {}) => {
    let response;
    try {
      response = await fetcher(origin + path, {
        method, redirect: 'error', signal: AbortSignal.timeout(30_000),
        headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
        ...(body ? {body: JSON.stringify(body)} : {}),
      });
    } catch { throw new AuditError('network_error'); }
    if (allow404 && response.status === 404) return null;
    requireValue(response.ok, `http_${response.status}`);
    try { return await response.json(); }
    catch { throw new AuditError('invalid_response'); }
  };
}
export function neutralError(error) {
  console.error(error instanceof AuditError ? error.message : 'operation_failed');
  process.exitCode = 1;
}
