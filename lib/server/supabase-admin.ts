// Hanya untuk kode server (app/api/*). Jangan pernah di-import dari komponen browser.
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AgreementError } from "@/lib/agreement-logic";

let admin: SupabaseClient | null = null;

export function getAdmin(): SupabaseClient {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new AgreementError(
      "Server belum dihubungkan ke Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi).",
      503,
      "NOT_CONFIGURED"
    );
  }
  admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}
