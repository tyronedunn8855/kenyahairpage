/* Supabase connection for the booking calendar and the owner panel (/admin/).
   Project URL and the publishable (anon) key from Supabase > Project Settings > API Keys.
   The anon key is meant to be public: Row Level Security (supabase/setup.sql) decides what it can do.
   Never paste the service_role key here or anywhere on the site.
   While these are empty, the calendar keeps reading the Google Sheet and the panel says it isn't connected. */
window.KD_SUPABASE = {
  url: 'https://mktcajxidyxvfxzrdkko.supabase.co',
  anonKey: 'sb_publishable_MPXmajP00xipObLQvOPZfw_ORMo3Sg7'
};
