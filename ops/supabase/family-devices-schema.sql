-- Dedicated family project only. No user/password data in these tables.
begin;
create table public.famille_devices (
 token_hash text primary key check(token_hash ~ '^[0-9a-f]{64}$'),
 parent_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '90 days'
);
create index famille_devices_parent on public.famille_devices(parent_id);
create table public.famille_parent_setup (
 token_hash text primary key check(token_hash ~ '^[0-9a-f]{64}$'),
 used_at timestamptz not null default now()
);
alter table public.famille_devices enable row level security;
alter table public.famille_parent_setup enable row level security;
revoke all on public.famille_devices,public.famille_parent_setup from public,anon,authenticated;
grant all on public.famille_devices,public.famille_parent_setup to service_role;

create function public.famille_register_device(p_parent uuid,p_digest text,p_previous text default null)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if p_parent is null or p_digest is null or p_digest !~ '^[0-9a-f]{64}$' then raise exception 'invalid_device'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_parent::text,55));
 delete from public.famille_devices where parent_id=p_parent and (expires_at<=now() or token_hash=p_previous);
 if (select count(*) from public.famille_devices where parent_id=p_parent)>=20 then raise exception 'device_limit'; end if;
 insert into public.famille_devices(token_hash,parent_id) values(p_digest,p_parent);
 return true;
end $$;
create function public.famille_revoke_devices(p_parent uuid,p_digest text default null)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_parent::text,55));
 delete from public.famille_devices where parent_id=p_parent and (p_digest is null or token_hash=p_digest);
 return true;
end $$;
create function public.famille_claim_parent_setup(p_digest text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare claimed integer;
begin
 insert into public.famille_parent_setup(token_hash) values(p_digest) on conflict do nothing;
 get diagnostics claimed=row_count;
 return claimed=1;
end $$;
revoke all on function public.famille_register_device(uuid,text,text),public.famille_revoke_devices(uuid,text),public.famille_claim_parent_setup(text) from public,anon,authenticated;
grant execute on function public.famille_register_device(uuid,text,text),public.famille_revoke_devices(uuid,text),public.famille_claim_parent_setup(text) to service_role;
commit;
