-- Supprimer les posts expirés (à exécuter via un cron ou manuellement)
-- Dans Supabase : Database → Extensions → activer pg_cron
-- Puis exécuter :

select cron.schedule(
  'supprimer-posts-expires',
  '0 * * * *', -- toutes les heures
  $$
    delete from posts
    where status = 'approved'
    and expires_at < now();
  $$
);
