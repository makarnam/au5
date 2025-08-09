import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iuxhefuorkpbmwxmxtqd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGhlZnVvcmtwYm13eG14dHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTMxMDMsImV4cCI6MjA2OTI2OTEwM30.q3fnuQF_Yt5U6cKLn3DQ0AeOpmkalspddvqXdnlSxS4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Ensure API key headers are always present on requests
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
