// Minimal fetch wrapper to ensure the Supabase `apikey` header is present
// for any direct REST calls that might bypass the official supabase-js client.

// Import URL and key from the central client file
// Note: we import values indirectly by reading from the constructed client module.
import { supabase } from './supabase';

const SUPABASE_URL: string | undefined = (supabase as any)?.supabaseUrl;
const SUPABASE_ANON_KEY: string | undefined = (supabase as any)?.clientOptions?.global?.headers?.apikey;

// If environment already configured, patch fetch once
if (typeof window !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;

      if (url && url.startsWith(`${SUPABASE_URL}/rest/v1`)) {
        const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined) || {});

        if (!headers.has('apikey')) {
          headers.set('apikey', SUPABASE_ANON_KEY);
        }

        // Do not override Authorization; let supabase-js handle auth for its own requests
        const nextInit: RequestInit = { ...init, headers };
        return originalFetch(input, nextInit);
      }
    } catch {
      // fall through to original fetch on any parsing error
    }

    return originalFetch(input as any, init);
  };
}


