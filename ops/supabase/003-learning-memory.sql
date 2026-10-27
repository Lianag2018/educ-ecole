-- Proposal for the personal school project only; requires 002 and school-plans-schema.sql.
begin;
create table public.famille_learning_state (
 parent_id uuid not null, profile_slot text not null,
 revision bigint not null default 0, attempted_revision bigint not null default -1,
 last_attempt timestamptz, claim_id uuid, advice jsonb, advice_revision bigint,
 primary key(parent_id,profile_slot),
 foreign key(parent_id,profile_slot) references public.famille_voice_profiles on delete cascade
);
create table public.famille_learning_events (
 parent_id uuid not null, profile_slot text not null, event_id uuid not null,
 sequence bigint not null, event jsonb not null check(octet_length(event::text)<=2000),
 primary key(parent_id,profile_slot,event_id), unique(parent_id,profile_slot,sequence),
 foreign key(parent_id,profile_slot) references public.famille_voice_profiles on delete cascade
);
alter table public.famille_learning_state enable row level security;
alter table public.famille_learning_state force row level security;
alter table public.famille_learning_events enable row level security;
alter table public.famille_learning_events force row level security;
revoke all on public.famille_learning_state,public.famille_learning_events from public,anon,authenticated;
grant select,insert,update,delete on public.famille_learning_state,public.famille_learning_events to service_role;

-- Same per-profile lock as school-plan writes: sequence order also equals commit
-- order. A cursor cannot skip a concurrent transaction that commits later.
create function public.famille_sync_learning(p_parent uuid,p_slot text,p_events jsonb,p_after bigint)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare e jsonb; prior jsonb; n bigint; cursor_out bigint; page jsonb;
begin
 if p_events is null or jsonb_typeof(p_events)<>'array' or jsonb_array_length(p_events)>100 or p_after is null or p_after<0 then raise exception 'invalid_batch'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_parent::text||p_slot,0));
 insert into public.famille_learning_state(parent_id,profile_slot) values(p_parent,p_slot) on conflict do nothing;
 select revision into n from public.famille_learning_state where parent_id=p_parent and profile_slot=p_slot for update;
 if p_after>n then raise exception 'invalid_cursor'; end if;
 for e in select value from jsonb_array_elements(p_events) loop
  if jsonb_typeof(e)<>'object' or not(e ?& array['syncId','id','skill','day','result','activityLevel'])
   or e-array['syncId','id','skill','day','subject','result','activityLevel','submittedResult']<>'{}'::jsonb
   or (e->>'syncId')!~*'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
   or e->>'result' not in ('correct','help','incorrect') then raise exception 'invalid_event'; end if;
  select event into prior from public.famille_learning_events where parent_id=p_parent and profile_slot=p_slot and event_id=(e->>'syncId')::uuid;
  if found then
   if prior<>e then raise exception 'event_conflict'; end if;
  else
   n:=n+1;
   insert into public.famille_learning_events values(p_parent,p_slot,(e->>'syncId')::uuid,n,e);
  end if;
 end loop;
 update public.famille_learning_state set revision=n where parent_id=p_parent and profile_slot=p_slot;
 select coalesce(jsonb_agg(event order by sequence),'[]'),coalesce(max(sequence),p_after) into page,cursor_out
 from (select event,sequence from public.famille_learning_events where parent_id=p_parent and profile_slot=p_slot and sequence>p_after order by sequence limit 100) batch;
 return jsonb_build_object('events',page,'cursor',cursor_out,'more',exists(select 1 from public.famille_learning_events where parent_id=p_parent and profile_slot=p_slot and sequence>cursor_out),
  'advice',(select advice from public.famille_learning_state where parent_id=p_parent and profile_slot=p_slot));
end $$;

create function public.famille_plan_learning_changed() returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(new.parent_id::text||new.profile_slot,0));
 insert into public.famille_learning_state(parent_id,profile_slot,revision) values(new.parent_id,new.profile_slot,1)
 on conflict(parent_id,profile_slot) do update set revision=famille_learning_state.revision+1;
 return new;
end $$;
create trigger famille_plan_learning_changed after insert on public.famille_school_plans for each row execute function public.famille_plan_learning_changed();
-- Existing documents also become eligible once, without exposing their contents.
insert into public.famille_learning_state(parent_id,profile_slot,revision)
 select distinct parent_id,profile_slot,1 from public.famille_school_plans on conflict do nothing;

create function public.famille_claim_learning(p_parent uuid,p_slot text,p_claim uuid)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare s public.famille_learning_state; events jsonb; plans jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_parent::text||p_slot,0));
 select * into s from public.famille_learning_state where parent_id=p_parent and profile_slot=p_slot for update;
 if not found or s.revision=0 or s.revision<=s.attempted_revision or (s.last_attempt at time zone 'America/Toronto')::date=(now() at time zone 'America/Toronto')::date then return 'null'::jsonb; end if;
 -- Claim is durable BEFORE budget/provider. No automatic repeat of this revision
 -- after a timeout, crash or ambiguous response. New work waits until next day.
 update public.famille_learning_state set attempted_revision=revision,last_attempt=now(),claim_id=p_claim where parent_id=p_parent and profile_slot=p_slot;
 select coalesce(jsonb_agg(event order by sequence),'[]') into events from
  (select event,sequence from public.famille_learning_events where parent_id=p_parent and profile_slot=p_slot order by sequence desc limit 2000) recent;
 select coalesce(jsonb_agg(plan order by created_at desc),'[]') into plans from
  (select plan,created_at from public.famille_school_plans where parent_id=p_parent and profile_slot=p_slot order by created_at desc limit 2) recent;
 return jsonb_build_object('revision',s.revision,'history',events,'plans',plans);
end $$;

create function public.famille_finish_learning(p_parent uuid,p_slot text,p_claim uuid,p_advice jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if p_advice is null or jsonb_typeof(p_advice)<>'object' or octet_length(p_advice::text)>2000 then raise exception 'invalid_advice'; end if;
 update public.famille_learning_state set advice=p_advice,advice_revision=attempted_revision
 where parent_id=p_parent and profile_slot=p_slot and claim_id=p_claim;
 if not found then raise exception 'stale_claim'; end if;
 return '{}'::jsonb;
end $$;
revoke all on function public.famille_sync_learning(uuid,text,jsonb,bigint),public.famille_claim_learning(uuid,text,uuid),public.famille_finish_learning(uuid,text,uuid,jsonb),public.famille_plan_learning_changed() from public,anon,authenticated;
grant execute on function public.famille_sync_learning(uuid,text,jsonb,bigint),public.famille_claim_learning(uuid,text,uuid),public.famille_finish_learning(uuid,text,uuid,jsonb),public.famille_plan_learning_changed() to service_role;
commit;
