// Server-only Supabase client using the SERVICE ROLE key (bypasses RLS).
// Used by the Razorpay webhook to update plans/subscriptions. NEVER import
// this into client components — the service role key must stay server-side.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin: SupabaseClient | null =
  url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;
