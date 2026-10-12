-- ==============================================================================
-- Sepakatin — Migrasi 004: Keamanan, Siklus Token Review, & Jejak Audit Admin
-- Jalankan di Supabase Dashboard → SQL Editor → Run.
-- ==============================================================================

-- 1. Tambahkan kolom masa berlaku token review klien (14 hari TTL)
alter table public.agreements
  add column if not exists review_token_expires_at timestamptz;

create index if not exists idx_agreements_review_token_expires
  on public.agreements (review_token, review_token_expires_at);

-- 2. Tabel & Fungsi Pembatas Laju Permintaan Terdistribusi (Distributed Rate Limiting)
-- Menjamin proteksi atomik lintas instans serverless Vercel tanpa biaya / layanan Redis tambahan.
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  reset_at timestamptz not null
);

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_reset_at timestamptz;
  v_count integer;
  v_allowed boolean;
begin
  insert into public.rate_limits (key, count, reset_at)
  values (p_key, 1, v_now + (p_window_seconds || ' seconds')::interval)
  on conflict (key) do update
  set
    count = case when public.rate_limits.reset_at <= v_now then 1 else public.rate_limits.count + 1 end,
    reset_at = case when public.rate_limits.reset_at <= v_now then v_now + (p_window_seconds || ' seconds')::interval else public.rate_limits.reset_at end
  returning count, reset_at into v_count, v_reset_at;

  v_allowed := (v_count <= p_limit);
  return jsonb_build_object(
    'allowed', v_allowed,
    'retry_after_seconds', case when v_allowed then 0 else greatest(1, ceil(extract(epoch from (v_reset_at - v_now)))) end
  );
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- 3. Tabel Jejak Audit Administrator (Admin Audit Logs)
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  admin_email text not null,
  action text not null, -- 'UPDATE_PLAN', 'UPDATE_CREDITS', 'CANCEL_AGREEMENT', 'DELETE_AGREEMENT'
  target_type text not null, -- 'USER', 'AGREEMENT'
  target_id text not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_created
  on public.admin_audit_logs (created_at desc);

create index if not exists idx_admin_audit_logs_admin
  on public.admin_audit_logs (admin_id);

-- RLS untuk jejak audit admin
alter table public.admin_audit_logs enable row level security;

-- Hanya service role yang dapat menulis log (lewat API server terproteksi)
revoke insert, update, delete on public.admin_audit_logs from anon, authenticated;
grant all on public.admin_audit_logs to service_role;
