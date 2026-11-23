-- Sons de la famille (réserve privée) : le parent connecté est la RÉFÉRENCE, les tablettes autorisées se mettent à jour seules.
-- À lancer UNE FOIS dans le projet Supabase DÉDIÉ À LA FAMILLE (éditeur SQL), jamais dans un projet professionnel.
-- Aucune donnée d'enfant autre que les enregistrements de sons choisis par le parent; accès serveur seulement (service_role).
begin;
create table if not exists public.famille_sounds (
 parent_id uuid not null references auth.users(id) on delete cascade,
 sound_id text not null check(sound_id ~ '^[a-z][a-z-]{0,15}$'),
 data_b64 text not null check(length(data_b64) between 600 and 560000),
 updated_at timestamptz not null default now(),
 primary key(parent_id,sound_id)
);
create table if not exists public.famille_sound_settings (
 parent_id uuid primary key references auth.users(id) on delete cascade,
 ms jsonb not null default '{}'::jsonb check(jsonb_typeof(ms)='object'),
 updated_at timestamptz not null default now()
);
alter table public.famille_sounds enable row level security;
alter table public.famille_sound_settings enable row level security;
revoke all on public.famille_sounds,public.famille_sound_settings from public,anon,authenticated;
grant all on public.famille_sounds,public.famille_sound_settings to service_role;

create or replace function public.famille_put_sound(p_parent uuid,p_id text,p_data text)
returns timestamptz language plpgsql security invoker set search_path='' as $$
declare t timestamptz;
begin
 if p_parent is null or p_id !~ '^[a-z][a-z-]{0,15}$' or p_data is null then raise exception 'invalid_sound'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_parent::text,77));
 if (select count(*) from public.famille_sounds where parent_id=p_parent and sound_id<>p_id)>=120 then raise exception 'sound_limit'; end if;
 insert into public.famille_sounds(parent_id,sound_id,data_b64,updated_at) values(p_parent,p_id,p_data,now())
 on conflict(parent_id,sound_id) do update set data_b64=excluded.data_b64,updated_at=now()
 returning updated_at into t;
 return t;
end $$;
create or replace function public.famille_delete_sound(p_parent uuid,p_id text)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 delete from public.famille_sounds where parent_id=p_parent and sound_id=p_id;
 return true;
end $$;
create or replace function public.famille_put_sound_settings(p_parent uuid,p_ms jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if p_parent is null or jsonb_typeof(p_ms)<>'object' then raise exception 'invalid_settings'; end if;
 insert into public.famille_sound_settings(parent_id,ms,updated_at) values(p_parent,p_ms,now())
 on conflict(parent_id) do update set ms=excluded.ms,updated_at=now();
 return true;
end $$;
revoke all on function public.famille_put_sound(uuid,text,text),public.famille_delete_sound(uuid,text),public.famille_put_sound_settings(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.famille_put_sound(uuid,text,text),public.famille_delete_sound(uuid,text),public.famille_put_sound_settings(uuid,jsonb) to service_role;
commit;
