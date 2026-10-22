-- Reviewed schema proposal; not a claim that the personal database has been provisioned.
-- Execute only on the dedicated educational Supabase project.
begin;
create table public.famille_school_plans (
 parent_id uuid not null references auth.users(id) on delete cascade,
 profile_slot text not null check(profile_slot in ('p1','p2')),
 digest text not null check(digest ~ '^[a-f0-9]{64}$'),
 plan jsonb not null check(jsonb_typeof(plan)='object' and octet_length(plan::text)<=30000 and plan->>'profileId'=profile_slot),
 created_at timestamptz not null default now(),
 primary key(parent_id,profile_slot,digest)
);
alter table public.famille_school_plans enable row level security;
alter table public.famille_school_plans force row level security;
revoke all on public.famille_school_plans from public,anon,authenticated;
grant select,insert,delete on public.famille_school_plans to service_role;
create function public.famille_save_plan(p_parent uuid,p_slot text,p_digest text,p_plan jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from public.famille_voice_profiles where parent_id=p_parent and profile_slot=p_slot) then raise exception 'profile_forbidden'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_parent::text||p_slot,0));
 insert into public.famille_school_plans(parent_id,profile_slot,digest,plan) values(p_parent,p_slot,p_digest,p_plan) on conflict do nothing;
 delete from public.famille_school_plans where parent_id=p_parent and profile_slot=p_slot and digest not in
 (select digest from public.famille_school_plans where parent_id=p_parent and profile_slot=p_slot order by created_at desc,digest limit 12);
 return '{}'::jsonb;
end $$;
revoke all on function public.famille_save_plan(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.famille_save_plan(uuid,text,text,jsonb) to service_role;
commit;
