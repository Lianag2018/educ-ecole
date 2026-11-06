DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name='educ_grok_relay_ticket_key') THEN
  PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'educ_grok_relay_ticket_key','Dedicated encryption key for personal school relay tickets');
 END IF;
END $$;
CREATE OR REPLACE FUNCTION public.famille_grok_relay_key() RETURNS text
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
 SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='educ_grok_relay_ticket_key';
$$;
REVOKE ALL ON FUNCTION public.famille_grok_relay_key() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.famille_grok_relay_key() TO service_role;
