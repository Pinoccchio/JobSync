import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for Server Components and API Routes
 * Note: For server-side operations, use service role key or handle auth via client
 * This creates a basic client for server-side database operations
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
