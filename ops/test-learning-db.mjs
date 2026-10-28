import {execFileSync,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const url=process.env.EDUC_TEST_DATABASE_URL;
const parsed=new URL(url||'postgresql://invalid');
if(!['localhost','127.0.0.1'].includes(parsed.hostname)||parsed.pathname!=='/educ_test')throw Error('Disposable local educ_test database required.');
const args=['-X','-q','-v','ON_ERROR_STOP=1',url];
execFileSync('psql',[...args,'-f','ops/tests/rls-fixture.sql'],{stdio:'pipe'});
execFileSync('psql',[...args,'-f','ops/tests/learning-db.sql'],{stdio:'pipe'});
const run=async sql=>(await promisify(execFile)('psql',[...args,'-t','-A','-c',sql])).stdout.trim();
const parent='22222222-2222-4222-8222-222222222222',id=randomUUID();
const event=JSON.stringify([{syncId:id,id:'synthetic',skill:'mots',day:'2026-10-27',subject:'Français',result:'help',activityLevel:1}]);
// Six independent sessions race the same upload: one event and revision only.
await Promise.all(Array.from({length:6},()=>run(`set role service_role; select public.famille_sync_learning('${parent}','p1','${event}',0);`)));
assert.equal(await run(`select count(*) from public.famille_learning_events where parent_id='${parent}';`),'1');
const claims=await Promise.all(Array.from({length:6},()=>run(`set role service_role; select public.famille_claim_learning('${parent}','p1','${randomUUID()}');`)));
assert.equal(claims.filter(x=>x!=='null').length,1);
console.log('Private learning SQL: isolation, RLS, duplicate uploads, concurrent claims and shared budget passed.');
