import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client
 * Uses the anon key for client-side operations
 * Automatically handles cookies for authentication
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Export a singleton instance for convenience
export const supabase = createClient();
