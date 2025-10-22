import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client with service role key
 * USE WITH CAUTION - This client bypasses Row Level Security (RLS)
 * Only use server-side for privileged operations like:
 * - User management (creating admin accounts)
 * - Bulk data operations
 * - System-level queries
 *
 * NEVER expose this client to the browser!
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Creates a new admin client instance
 * Useful for fresh connections in API routes
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
