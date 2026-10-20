// Extra delivery check only. Does not change or replace the supervisor's controls.
import {readFileSync} from 'node:fs';
// Feed NUL-separated git diff + untracked paths through stdin.
const paths = [...new Set(readFileSync(0, 'utf8').split('\0').filter(Boolean))];
if (!paths.length) throw Error('delivery_paths_required');
const bad = paths.filter(p => !p.startsWith('projects/lecture-famille/') && p !== '.github/workflows/educ-ecole-vercel.yml');
if (bad.length) { console.error('Outside delivery zones:', ...bad); process.exitCode = 1; }
else console.log(`Strict delivery zones passed: ${paths.length} files; only projects/lecture-famille/ and .github/workflows/educ-ecole-vercel.yml`);
