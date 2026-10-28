-- Run after learning-db.sql, exclusively with synthetic users in educ_test.
reset role;
\i ops/supabase/family-devices-schema.sql
set role service_role;
do $$
declare p uuid:='11111111-1111-4111-8111-111111111111'; q uuid:='22222222-2222-4222-8222-222222222222'; denied boolean:=false;
begin
 if not public.famille_claim_parent_setup(repeat('a',64)) then raise exception 'first claim refused'; end if;
 if public.famille_claim_parent_setup(repeat('a',64)) then raise exception 'repeated operator token'; end if;
 perform public.famille_register_device(p,repeat('b',64));
 if (select expires_at-created_at from public.famille_devices where token_hash=repeat('b',64))<>interval '90 days' then raise exception 'wrong expiry'; end if;
 perform public.famille_register_device(p,repeat('c',64),repeat('b',64));
 if exists(select 1 from public.famille_devices where token_hash=repeat('b',64)) then raise exception 'old device survives replacement'; end if;
 perform public.famille_register_device(q,repeat('d',64));
 perform public.famille_revoke_devices(p,repeat('d',64));
 if not exists(select 1 from public.famille_devices where token_hash=repeat('d',64)) then raise exception 'cross parent revoke'; end if;
 perform public.famille_revoke_devices(p,null);
 if exists(select 1 from public.famille_devices where parent_id=p) then raise exception 'revoke all failed'; end if;
 for i in 1..20 loop perform public.famille_register_device(p,lpad(to_hex(i),64,'0')); end loop;
 begin perform public.famille_register_device(p,repeat('f',64)); exception when raise_exception then denied:=sqlerrm='device_limit'; end;
 if not denied then raise exception 'device limit bypassed'; end if;
 update public.famille_devices set expires_at=now()-interval '1 second' where parent_id=p;
 perform public.famille_register_device(p,repeat('e',64));
 if (select count(*) from public.famille_devices where parent_id=p)<>1 then raise exception 'expired device cleanup'; end if;
end $$;
reset role;
do $$
declare r text; t text; fn text;
begin
 foreach r in array array['anon','authenticated'] loop
  foreach t in array array['famille_devices','famille_parent_setup'] loop
   if has_table_privilege(r,'public.'||t,'SELECT') or has_table_privilege(r,'public.'||t,'INSERT') then raise exception 'public device access'; end if;
   if not (select relrowsecurity from pg_class where oid=('public.'||t)::regclass) then raise exception 'RLS missing'; end if;
  end loop;
  foreach fn in array array['famille_register_device(uuid,text,text)','famille_revoke_devices(uuid,text)','famille_claim_parent_setup(text)'] loop
   if has_function_privilege(r,'public.'||fn,'EXECUTE') then raise exception 'public device RPC'; end if;
  end loop;
 end loop;
end $$;
