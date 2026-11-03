import { createClient } from "@supabase/supabase-js";
// SERVER ONLY. Bypasses RLS: always filter by tenant_id yourself.
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
