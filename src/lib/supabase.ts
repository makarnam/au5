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
    storageKey: 'au5-auth-token',
    storage: {
      getItem: (key: string) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (error) {
          console.error('Error reading from storage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to storage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from storage:', error);
        }
      },
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
