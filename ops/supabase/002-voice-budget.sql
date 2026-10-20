-- PREPARATION ONLY: apply to the dedicated school Supabase project after review.
-- No transcript/audio/history columns. Profiles provisioned by the parent operator.
begin;
create table public.famille_voice_profiles (
 parent_id uuid not null references auth.users(id) on delete cascade,
 profile_slot text not null check(profile_slot in ('p1','p2')),
 stage text not null check(stage in ('1re année','3e année')),
 focus text not null default '' check(length(focus)<=160),
 assignments jsonb not null default '[]' check(jsonb_typeof(assignments)='array' and octet_length(assignments::text)<=20000),
 primary key(parent_id,profile_slot)
);
create table public.famille_voice_months (
 parent_id uuid not null references auth.users(id), month text not null,
 committed bigint not null default 0 check(committed between 0 and 40000000),
 primary key(parent_id,month)
);
create table public.famille_voice_reservations (
 id uuid primary key, parent_id uuid not null references auth.users(id),
 month text not null, amount bigint not null check(amount>0),
 created_at timestamptz not null default now()
);
create index on public.famille_voice_reservations(parent_id,created_at);
alter table public.famille_voice_profiles enable row level security;
alter table public.famille_voice_months enable row level security;
alter table public.famille_voice_reservations enable row level security;
revoke all on public.famille_voice_profiles,public.famille_voice_months,public.famille_voice_reservations from public,anon,authenticated;
grant all on public.famille_voice_profiles,public.famille_voice_months,public.famille_voice_reservations to service_role;
create function public.famille_reserve_voice(p_parent uuid,p_slot text,p_id uuid,p_amount bigint,p_other bigint)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare m text:=to_char(now() at time zone 'America/Toronto','YYYY-MM'); used bigint;
begin
 if p_amount is null or p_amount<=0 or p_amount>40000000 or p_other is null or p_other<=0 or p_other>=40000000 then raise exception 'invalid_budget'; end if;
 if not exists(select 1 from public.famille_voice_profiles where parent_id=p_parent and profile_slot=p_slot) then raise exception 'profile_forbidden'; end if;
 -- Parent lock serializes both profiles, rate limits and month transitions.
 perform pg_advisory_xact_lock(hashtextextended(p_parent::text,0));
 if (select count(*) from public.famille_voice_reservations where parent_id=p_parent and created_at>now()-interval '1 minute')>=6 then raise exception 'rate_limit'; end if;
 insert into public.famille_voice_months(parent_id,month) values(p_parent,m) on conflict do nothing;
 select committed into used from public.famille_voice_months where parent_id=p_parent and month=m for update;
 if used+p_amount+p_other>40000000 then raise exception 'budget_cap'; end if;
 insert into public.famille_voice_reservations(id,parent_id,month,amount) values(p_id,p_parent,m,p_amount);
 update public.famille_voice_months set committed=committed+p_amount where parent_id=p_parent and month=m;
end $$;
revoke all on function public.famille_reserve_voice(uuid,text,uuid,bigint,bigint) from public,anon,authenticated;
grant execute on function public.famille_reserve_voice(uuid,text,uuid,bigint,bigint) to service_role;
commit;
