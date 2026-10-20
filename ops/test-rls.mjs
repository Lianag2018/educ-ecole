import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
// An explicit disposable local database is mandatory. No remote fallback.
const raw = process.env.FAMILLE_TEST_DATABASE_URL;
let url;
try { url = new URL(raw); } catch { throw Error('local_test_database_required'); }
if (url.protocol !== 'postgresql:' || !['127.0.0.1', 'localhost'].includes(url.hostname) ||
    url.pathname !== '/famille_test' || url.search || url.hash) throw Error('local_test_database_required');
const files = ['tests/rls-fixture.sql', 'supabase/001-parent-backups.sql', 'tests/rls.sql'];
const result = spawnSync('psql', ['-X', '--no-password', '-v', 'ON_ERROR_STOP=1', ...files.flatMap(f => ['-f', fileURLToPath(new URL(f, import.meta.url))])], {
  env: {PATH: process.env.PATH, PGHOST: url.hostname, PGPORT: url.port || '5432', PGDATABASE: 'famille_test',
    PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password)},
  encoding: 'utf8',
});
if (result.error || result.status !== 0) { console.error('local_rls_test_failed'); process.exitCode = 1; }
else console.log('RLS passed: two parents CRUD, cross-parent denial, anon denial, reassignment denial, Auth cascade');
