// Requires the same explicitly disposable local DB as test:rls, after that test.
import {spawn,spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const u=new URL(process.env.FAMILLE_TEST_DATABASE_URL||'invalid:');
if(u.protocol!=='postgresql:'||!['127.0.0.1','localhost'].includes(u.hostname)||u.pathname!=='/famille_test'||u.search||u.hash)throw Error('local_test_database_required');
const env={PATH:process.env.PATH,PGHOST:u.hostname,PGPORT:u.port||'5432',PGDATABASE:'famille_test',PGUSER:decodeURIComponent(u.username),PGPASSWORD:decodeURIComponent(u.password)};
const args=['-X','--no-password','-v','ON_ERROR_STOP=1','-q','-t','-A'];
function sql(s){const r=spawnSync('psql',[...args,'-c',s],{env,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();}
const parent='11111111-1111-4111-8111-111111111111';
try{
 sql('create role service_role nologin bypassrls');
 sql(readFileSync(new URL('./supabase/002-voice-budget.sql',import.meta.url),'utf8'));
 sql(`insert into public.famille_voice_profiles(parent_id,profile_slot,stage) values('${parent}','p1','1re année'),('${parent}','p2','3e année')`);
 const attempts=Array.from({length:20},(_,i)=>new Promise(resolve=>{
 const id=`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`;
 const p=spawn('psql',[...args,'-c',`set role service_role; select public.famille_reserve_voice('${parent}','p${i%2+1}','${id}',10000000,2000000)`],{env,stdio:'ignore'});p.on('close',code=>resolve(code));p.on('error',()=>resolve(1));
 }));
 const results=await Promise.all(attempts);assert.equal(results.filter(c=>c===0).length,3);
 assert.equal(sql(`select committed from public.famille_voice_months where parent_id='${parent}'`),'30000000');
 assert.equal(sql('select count(*) from public.famille_voice_reservations'),'3');
 const duplicate=sql('select id from public.famille_voice_reservations limit 1');
 assert.throws(()=>sql(`select public.famille_reserve_voice('${parent}','p1','${duplicate}',1,1)`));
 assert.equal(sql(`select committed from public.famille_voice_months where parent_id='${parent}'`),'30000000');
 // Duplicate IDs, other parent and client role must not debit or access tables.
 assert.throws(()=>sql(`select public.famille_reserve_voice('${parent}','p1','00000000-0000-4000-8000-999999999999',10000001,2000000)`));
 for(const role of ['anon','authenticated']){assert.throws(()=>sql(`set role ${role}; select * from public.famille_voice_profiles`));assert.throws(()=>sql(`set role ${role}; select public.famille_reserve_voice('${parent}','p1','00000000-0000-4000-8000-999999999998',1,1)`));}
 assert.throws(()=>sql("select public.famille_reserve_voice('22222222-2222-4222-8222-222222222222','p1','00000000-0000-4000-8000-999999999997',1,1)"));
 // A separate parent gets a fresh ledger and shared six-per-minute limit.
 const second='22222222-2222-4222-8222-222222222222';sql(`insert into public.famille_voice_profiles(parent_id,profile_slot,stage) values('${second}','p1','1re année')`);
 for(let i=0;i<6;i++)sql(`select public.famille_reserve_voice('${second}','p1','10000000-0000-4000-8000-${String(i).padStart(12,'0')}',1,1)`);
 assert.throws(()=>sql(`select public.famille_reserve_voice('${second}','p1','10000000-0000-4000-8000-999999999999',1,1)`));
 assert.equal(sql(`select committed from public.famille_voice_months where parent_id='${second}'`),'6');
 console.log('PostgreSQL durable voice budget: 20 concurrent processes, shared profiles, cap, rollback, rate limit, role denial, parent isolation passed.');
}finally{
 sql('drop function if exists public.famille_reserve_voice(uuid,text,uuid,bigint,bigint); drop table if exists public.famille_voice_reservations,public.famille_voice_months,public.famille_voice_profiles; drop role if exists service_role');
}
