import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase is optional. If keys are not set, the app uses the friendly
// sample data in lib/data.ts so you can see the full UI right away.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseReady = Boolean(url && anon);

export const supabase: SupabaseClient | null = isSupabaseReady
  ? createClient(url as string, anon as string)
  : null;
