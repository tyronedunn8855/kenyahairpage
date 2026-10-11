/* Supabase connection for the booking calendar and the owner panel (/admin/).
   Project URL and the publishable (anon) key from Supabase > Project Settings > API Keys.
   The anon key is meant to be public: Row Level Security (supabase/setup.sql) decides what it can do.
   Never paste the service_role key here or anywhere on the site.
   If these are emptied, the calendar falls back to the Google Sheet and the panel says it isn't connected. */
window.KD_SUPABASE = {
  url: 'https://mktcajxidyxvfxzrdkko.supabase.co',
  anonKey: 'sb_publishable_MPXmajP00xipObLQvOPZfw_ORMo3Sg7',
  // Public half of the alert key pair. The private half lives only in Vercel (VAPID_PRIVATE_KEY).
  vapidKey: 'BGyFVMssfClKbHWE61xQaJxWvXjxFkjvzEsfZxkJyr6L_tfRSnBWi81VRlwwxv6TTo4QBWK9CPnCer2FPH-gRh8'
};
