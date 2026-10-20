\set ON_ERROR_STOP on
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
insert into public.famille_parent_backups(parent_id, profile_slot, progress)
 values(auth.uid(),'p1','{"calibrated":false,"records":{}}');
update public.famille_parent_backups set progress='{"calibrated":true,"records":{}}';
do $$ begin
 if (select count(*) from public.famille_parent_backups where progress->'calibrated'='true') <> 1 then raise exception 'own read/update failed'; end if;
 begin
  update public.famille_parent_backups set parent_id='22222222-2222-4222-8222-222222222222';
  raise exception 'reassignment accepted';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.famille_parent_backups(parent_id, profile_slot, progress)
   values('22222222-2222-4222-8222-222222222222','p2','{"calibrated":false,"records":{}}');
  raise exception 'cross insert accepted';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ declare n int; begin
 if (select count(*) from public.famille_parent_backups) <> 0 then raise exception 'cross read'; end if;
 update public.famille_parent_backups set progress='{"calibrated":false,"records":{}}';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'cross update'; end if;
 delete from public.famille_parent_backups;
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'cross delete'; end if;
end $$;
insert into public.famille_parent_backups(parent_id,profile_slot,progress)
 values(auth.uid(),'p1','{"calibrated":false,"records":{}}');
update public.famille_parent_backups set progress='{"calibrated":true,"records":{}}';
do $$ begin
 if (select count(*) from public.famille_parent_backups where progress->'calibrated'='true') <> 1 then raise exception 'parent 2 CRUD'; end if;
 begin
  update public.famille_parent_backups set parent_id='11111111-1111-4111-8111-111111111111',profile_slot='p2';
  raise exception 'parent 2 reassignment';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.famille_parent_backups(parent_id,profile_slot,progress)
   values('11111111-1111-4111-8111-111111111111','p2','{"calibrated":false,"records":{}}');
  raise exception 'parent 2 cross insert';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ declare n int; begin
 if (select count(*) from public.famille_parent_backups) <> 1 then raise exception 'parent 1 data lost'; end if;
 update public.famille_parent_backups set version=1 where parent_id='22222222-2222-4222-8222-222222222222';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'parent 1 cross update'; end if;
 delete from public.famille_parent_backups where parent_id='22222222-2222-4222-8222-222222222222';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'parent 1 cross delete'; end if;
end $$;
delete from public.famille_parent_backups;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ begin
 if (select count(*) from public.famille_parent_backups) <> 1 then raise exception 'parent 2 data lost'; end if;
end $$;
delete from public.famille_parent_backups;
do $$ begin
 if (select count(*) from public.famille_parent_backups) <> 0 then raise exception 'own delete failed'; end if;
end $$;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
 begin
  insert into public.famille_parent_backups(parent_id,profile_slot,progress)
   values('11111111-1111-4111-8111-111111111111','p1','{"calibrated":false,"records":{}}');
  raise exception 'missing auth uid accepted';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
 begin perform * from public.famille_parent_backups; raise exception 'anon read'; exception when insufficient_privilege then null; end;
 begin insert into public.famille_parent_backups(parent_id,profile_slot,progress) values('11111111-1111-4111-8111-111111111111','p1','{"calibrated":false,"records":{}}'); raise exception 'anon insert'; exception when insufficient_privilege then null; end;
 begin update public.famille_parent_backups set version=1; raise exception 'anon update'; exception when insufficient_privilege then null; end;
 begin delete from public.famille_parent_backups; raise exception 'anon delete'; exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Auth user deletion cascades to their backup.
insert into public.famille_parent_backups(parent_id,profile_slot,progress)
 values('11111111-1111-4111-8111-111111111111','p1','{"calibrated":false,"records":{}}');
delete from auth.users where id='11111111-1111-4111-8111-111111111111';
do $$ begin
 if (select count(*) from public.famille_parent_backups) <> 0 then raise exception 'cascade failed'; end if;
end $$;
rollback;
\echo 'RLS: two parents CRUD, cross-parent, anon, reassignment, cascade passed'
