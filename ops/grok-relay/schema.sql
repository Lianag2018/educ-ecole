alter table public.famille_voice_reservations add column if not exists grok_used_at timestamptz;
create or replace function public.famille_consume_grok_ticket(p_id uuid,p_parent uuid)
returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare claimed uuid;
begin
 update public.famille_voice_reservations set grok_used_at=now()
 where id=p_id and parent_id=p_parent and grok_used_at is null
 and created_at>now()-interval '60 seconds' returning id into claimed;
 return claimed is not null;
end $$;
revoke all on function public.famille_consume_grok_ticket(uuid,uuid) from public,anon,authenticated;
grant execute on function public.famille_consume_grok_ticket(uuid,uuid) to service_role;
