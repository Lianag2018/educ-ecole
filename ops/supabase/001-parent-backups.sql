-- PREPARATION ONLY. Never applied remotely by the delivery workflow.
-- Parent Auth is the owner; p1/p2 are local slots, never authorization identities.
begin;
create table public.famille_parent_backups (
  parent_id uuid not null references auth.users(id) on delete cascade,
  profile_slot text not null check (profile_slot in ('p1', 'p2')),
  version integer not null default 1 check (version = 1),
  progress jsonb not null check (
    jsonb_typeof(progress) = 'object' and
    progress ?& array['calibrated', 'records'] and
    progress - array['calibrated', 'records'] = '{}'::jsonb and
    jsonb_typeof(progress->'calibrated') = 'boolean' and
    jsonb_typeof(progress->'records') = 'object' and
    octet_length(progress::text) <= 262144
  ),
  primary key (parent_id, profile_slot)
);
alter table public.famille_parent_backups enable row level security;
alter table public.famille_parent_backups force row level security;
revoke all on public.famille_parent_backups from public, anon, authenticated;
grant select, insert, update, delete on public.famille_parent_backups to authenticated;
create policy parent_select on public.famille_parent_backups for select to authenticated
  using ((select auth.uid()) = parent_id);
create policy parent_insert on public.famille_parent_backups for insert to authenticated
  with check ((select auth.uid()) = parent_id);
create policy parent_update on public.famille_parent_backups for update to authenticated
  using ((select auth.uid()) = parent_id) with check ((select auth.uid()) = parent_id);
create policy parent_delete on public.famille_parent_backups for delete to authenticated
  using ((select auth.uid()) = parent_id);
commit;
