-- Synthetic identities only. Executed in a disposable database by the PR job.
create role service_role nologin bypassrls;
grant usage on schema public,auth to service_role;
\i ops/supabase/002-voice-budget.sql
\i ops/supabase/school-plans-schema.sql
\i ops/supabase/003-learning-memory.sql
insert into public.famille_voice_profiles(parent_id,profile_slot,stage) values
 ('11111111-1111-4111-8111-111111111111','p1','1re année'),
 ('11111111-1111-4111-8111-111111111111','p2','3e année'),
 ('22222222-2222-4222-8222-222222222222','p1','1re année');
set role service_role;
do $$
declare p uuid:='11111111-1111-4111-8111-111111111111';
 event jsonb:='{"syncId":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","id":"synthetic-card","skill":"mots","day":"2026-10-27","subject":"Français","result":"help","activityLevel":1}';
 data jsonb; claimed jsonb; collision boolean:=false;
begin
 data:=public.famille_sync_learning(p,'p1',jsonb_build_array(event),0);
 if data->>'cursor'<>'1' or jsonb_array_length(data->'events')<>1 then raise exception 'sync failed'; end if;
 data:=public.famille_sync_learning(p,'p1',jsonb_build_array(event),1);
 if data->>'cursor'<>'1' or data->'events'<>'[]' then raise exception 'duplicate event'; end if;
 begin
  perform public.famille_sync_learning(p,'p1',jsonb_build_array(event||'{"result":"correct"}'),1);
 exception when raise_exception then collision:=sqlerrm='event_conflict'; end;
 if not collision then raise exception 'conflict not rejected'; end if;
 if (select revision from public.famille_learning_state where parent_id=p and profile_slot='p1')<>1 then raise exception 'conflict changed revision'; end if;
 data:=public.famille_sync_learning(p,'p2','[]',0);
 if data->'events'<>'[]' then raise exception 'cross child leak'; end if;
 data:=public.famille_sync_learning('22222222-2222-4222-8222-222222222222','p1','[]',0);
 if data->'events'<>'[]' then raise exception 'cross parent leak'; end if;
 if public.famille_claim_learning(p,'p2','cccccccc-cccc-4ccc-8ccc-cccccccccccc')<>'null' then raise exception 'empty analysis'; end if;
 claimed:=public.famille_claim_learning(p,'p1','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
 if claimed->>'revision'<>'1' or jsonb_array_length(claimed->'history')<>1 then raise exception 'claim failed'; end if;
 if public.famille_claim_learning(p,'p1','dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>'null' then raise exception 'paid retry'; end if;
 perform public.famille_finish_learning(p,'p1','cccccccc-cccc-4ccc-8ccc-cccccccccccc','{"priorities":["mots"],"strategy":"short_practice"}');
 data:=public.famille_sync_learning(p,'p1','[]',1);
 if data->'advice'->>'strategy'<>'short_practice' then raise exception 'advice missing'; end if;
 perform public.famille_save_plan(p,'p1',repeat('a',64),'{"profileId":"p1","tasks":[]}');
 perform public.famille_save_plan(p,'p1',repeat('a',64),'{"profileId":"p1","tasks":[]}');
 if (select revision from public.famille_learning_state where parent_id=p and profile_slot='p1')<>2 then raise exception 'plan not idempotent'; end if;
 if public.famille_claim_learning(p,'p1','dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>'null' then raise exception 'daily limit failed'; end if;
 update public.famille_learning_state set last_attempt=now()-interval '2 days' where parent_id=p and profile_slot='p1';
 if public.famille_claim_learning(p,'p1','dddddddd-dddd-4ddd-8ddd-dddddddddddd')->>'revision'<>'2' then raise exception 'pending new revision lost'; end if;
 collision:=false;
 begin
  perform public.famille_finish_learning(p,'p1','cccccccc-cccc-4ccc-8ccc-cccccccccccc','{}');
 exception when raise_exception then collision:=sqlerrm='stale_claim'; end;
 if not collision then raise exception 'late writer accepted'; end if;
 -- Shared budget: either child consumes the same hard 40 CAD cap.
 perform public.famille_reserve_voice(p,'p1','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',37000000,2000000);
 collision:=false;
 begin
  perform public.famille_reserve_voice(p,'p2','ffffffff-ffff-4fff-8fff-ffffffffffff',2000000,2000000);
 exception when raise_exception then collision:=sqlerrm='budget_cap'; end;
 if not collision then raise exception 'shared family cap bypassed'; end if;
 data:=public.famille_sync_learning(p,'p2',jsonb_build_array((event-'subject')||'{"syncId":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}'),0);
 if data->'events'->0 ? 'subject' then raise exception 'legacy subject rewritten'; end if;
end $$;
reset role;
do $$ begin
 if exists(select 1 from pg_class where oid in ('public.famille_learning_state'::regclass,'public.famille_learning_events'::regclass) and (not relrowsecurity or not relforcerowsecurity)) then raise exception 'RLS missing'; end if;
 if has_table_privilege('anon','public.famille_learning_events','SELECT') or has_table_privilege('authenticated','public.famille_learning_events','INSERT') or has_function_privilege('authenticated','public.famille_sync_learning(uuid,text,jsonb,bigint)','EXECUTE') then raise exception 'client privilege'; end if;
end $$;
set role authenticated;
do $$ declare denied boolean:=false; begin
 begin perform * from public.famille_learning_events; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'client can read events'; end if;
 denied:=false;
 begin perform public.famille_claim_learning('11111111-1111-4111-8111-111111111111','p1','cccccccc-cccc-4ccc-8ccc-cccccccccccc'); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'client can claim'; end if;
end $$;
reset role;
