-- ==============================================================================
-- Sepakatin â€” Skema database Supabase
-- Jalankan sekali di Supabase Dashboard â†’ SQL Editor â†’ New query â†’ Run.
--
-- Prinsip keamanan:
--   * Browser TIDAK bisa menulis tabel secara langsung. Semua perubahan lewat API
--     server Next.js (app/api/*) yang memakai service role dan menjalankan aturan bisnis.
--   * Batas paket Gratis juga dijaga di database (trigger), jadi tidak bisa diakali.
--   * Paket & kredit hanya bisa diubah admin (lewat Table Editor / service role).
-- ==============================================================================

-- Jika dulu pernah menjalankan skema versi lama, hapus komentar blok ini lalu jalankan sekali:
-- drop table if exists public.verification_records, public.activity_logs, public.milestones,
--   public.change_requests, public.agreement_approvals, public.agreement_versions,
--   public.project_parties, public.projects, public.agreements, public.profiles cascade;

-- ------------------------------------------------------------------------------
-- 1. Profil pengguna (1 baris per akun Supabase Auth)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  skill text not null default 'Freelancer',
  phone text not null default '',
  -- Paket akun: 'gratis' atau 'pro'. Diubah admin setelah pembayaran via WhatsApp.
  plan text not null default 'gratis' check (plan in ('gratis', 'pro')),
  -- Kosong = Pro tanpa batas waktu. Isi tanggal agar Pro otomatis berakhir.
  plan_expires_at timestamptz,
  -- Kredit Per Proyek: 1 kredit = 1 kesepakatan berfitur lengkap.
  project_credits integer not null default 0 check (project_credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 2. Kesepakatan (seluruh riwayat versi, persetujuan, tanda tangan disimpan di `record`)
-- ------------------------------------------------------------------------------
create table if not exists public.agreements (
  id text primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  contract_id text not null unique,
  review_token text not null unique,
  status text not null check (status in (
    'DRAFT', 'PENDING_CLIENT', 'CHANGES_REQUESTED', 'PENDING_APPROVAL', 'AGREED',
    'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'
  )),
  plan text not null check (plan in ('gratis', 'per-proyek', 'pro')),
  record jsonb not null,
  -- Penanda revisi baris untuk mencegah dua perubahan saling menimpa
  rev integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agreements_owner_created_idx on public.agreements (owner_id, created_at desc);

-- ------------------------------------------------------------------------------
-- 3. Profil otomatis dibuat saat ada akun baru
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. Aturan paket Gratis: maksimal 2 kesepakatan Gratis yang aktif
--    (samakan angkanya dengan FREE_RULES.maxActiveAgreements di lib/plans.ts)
-- ------------------------------------------------------------------------------
create or replace function public.enforce_free_agreement_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_count integer;
begin
  if new.plan = 'gratis' then
    -- Kunci per pengguna agar dua permintaan bersamaan tidak lolos batas
    perform pg_advisory_xact_lock(hashtext('sepakatin-free-limit:' || new.owner_id::text));
    select count(*) into active_count
    from public.agreements
    where owner_id = new.owner_id
      and plan = 'gratis'
      and status not in ('COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED');
    if active_count >= 2 then
      raise exception 'FREE_LIMIT_REACHED' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists agreements_free_limit on public.agreements;
create trigger agreements_free_limit
  before insert on public.agreements
  for each row execute function public.enforce_free_agreement_limit();

-- ------------------------------------------------------------------------------
-- 5. Kredit Per Proyek (hanya bisa dipanggil server / service role)
-- ------------------------------------------------------------------------------
create or replace function public.use_project_credit(p_user uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set project_credits = project_credits - 1, updated_at = now()
  where id = p_user and project_credits > 0;
  return found;
end;
$$;

create or replace function public.refund_project_credit(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set project_credits = project_credits + 1, updated_at = now()
  where id = p_user;
end;
$$;

revoke all on function public.use_project_credit(uuid) from public, anon, authenticated;
revoke all on function public.refund_project_credit(uuid) from public, anon, authenticated;
grant execute on function public.use_project_credit(uuid) to service_role;
grant execute on function public.refund_project_credit(uuid) to service_role;

-- ------------------------------------------------------------------------------
-- 6. updated_at otomatis
-- ------------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists agreements_touch on public.agreements;
create trigger agreements_touch before update on public.agreements
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------------------
-- 7. Row Level Security
--    Pengguna hanya bisa MEMBACA data miliknya sendiri. Tidak ada izin tulis dari browser.
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.agreements enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "agreements_select_own" on public.agreements;
create policy "agreements_select_own" on public.agreements
  for select to authenticated using (auth.uid() = owner_id);

revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.agreements from anon, authenticated;
revoke all on public.profiles from anon;
revoke all on public.agreements from anon;
-- ==============================================================================
-- Sepakatin â€” Migrasi 002: Indeks Performa & Skalabilitas Database
-- Jalankan di Supabase Dashboard â†’ SQL Editor â†’ Run.
-- ==============================================================================

-- 1. Mempercepat query filter status kesepakatan (Dashboard Freelancer & Admin)
create index if not exists idx_agreements_status on public.agreements (status);

-- 2. Mempercepat sorting kesepakatan terbaru secara global
create index if not exists idx_agreements_created_at on public.agreements (created_at desc);

-- 3. Mempercepat query kesepakatan per owner dan status aktif
create index if not exists idx_agreements_owner_status on public.agreements (owner_id, status);

-- 4. Mempercepat sorting profil pengguna di dashboard admin
create index if not exists idx_profiles_created_at on public.profiles (created_at desc);
-- ==============================================================================
-- Sepakatin â€” Migrasi 003: Arsitektur Supabase Storage untuk Dokumen Kontrak
-- Bucket: 'agreement-documents' (Private / Terproteksi)
-- Menghentikan penyimpanan string Base64 PDF di kolom agreements.record JSONB.
-- Jalankan di Supabase Dashboard â†’ SQL Editor â†’ Run.
-- ==============================================================================

-- 1. Buat bucket privat 'agreement-documents'
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agreement-documents',
  'agreement-documents',
  false,
  10485760, -- Batas maksimal 10 MB per berkas PDF
  array['application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf'];

-- 2. Kebijakan Row Level Security (RLS) pada storage.objects
-- Catatan: API Server Sepakatin memakai SUPABASE_SERVICE_ROLE_KEY sehingga otomatis
-- memiliki izin baca-tulis penuh. Kebijakan RLS di bawah ini diterapkan sebagai
-- lapisan pertahanan berlapis (defense-in-depth) untuk sesi terotentikasi.

-- Hak Akses Baca: Pemilik kesepakatan dapat membaca berkas di jalurnya sendiri
drop policy if exists "allow_authenticated_read_agreement_docs" on storage.objects;
create policy "allow_authenticated_read_agreement_docs" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'agreement-documents'
    and (
      exists (
        select 1 from public.agreements a
        where a.owner_id = auth.uid()
          and storage.objects.name like 'agreements/' || a.id || '/%'
      )
    )
  );

-- Hak Akses Unggah: Pemilik kesepakatan dapat mengunggah berkas ke folder kesepakatannya
drop policy if exists "allow_authenticated_upload_agreement_docs" on storage.objects;
create policy "allow_authenticated_upload_agreement_docs" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'agreement-documents'
    and (
      exists (
        select 1 from public.agreements a
        where a.owner_id = auth.uid()
          and storage.objects.name like 'agreements/' || a.id || '/%'
      )
    )
  );

-- Hak Akses Perbarui: Pemilik kesepakatan dapat memperbarui berkas miliknya
drop policy if exists "allow_authenticated_update_agreement_docs" on storage.objects;
create policy "allow_authenticated_update_agreement_docs" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'agreement-documents'
    and (
      exists (
        select 1 from public.agreements a
        where a.owner_id = auth.uid()
          and storage.objects.name like 'agreements/' || a.id || '/%'
      )
    )
  );

-- Hak Akses Hapus: Pemilik kesepakatan dapat menghapus berkas miliknya
drop policy if exists "allow_authenticated_delete_agreement_docs" on storage.objects;
create policy "allow_authenticated_delete_agreement_docs" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'agreement-documents'
    and (
      exists (
        select 1 from public.agreements a
        where a.owner_id = auth.uid()
          and storage.objects.name like 'agreements/' || a.id || '/%'
      )
    )
  );
-- ==============================================================================
-- Sepakatin â€” Migrasi 004: Keamanan, Siklus Token Review, & Jejak Audit Admin
-- Jalankan di Supabase Dashboard â†’ SQL Editor â†’ Run.
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
-- ==============================================================================
-- Sepakatin â€” Migrasi 005: Transaksi Pembayaran (Mayar.id/QRIS) & Log Notifikasi
-- Jalankan di Supabase Dashboard â†’ SQL Editor â†’ Run.
-- ==============================================================================

-- 1. Tabel Pesanan Pembayaran (Payment Orders)
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_email text not null,
  package_type text not null, -- 'credit_1' (Rp19.000) atau 'pro_monthly' (Rp49.000)
  amount numeric not null,
  payment_method text not null default 'QRIS',
  payment_gateway text not null default 'MAYAR',
  gateway_transaction_id text,
  payment_url text,
  status text not null default 'PENDING', -- 'PENDING', 'PAID', 'EXPIRED', 'FAILED'
  paid_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_payment_orders_user_id
  on public.payment_orders(user_id, created_at desc);

create index if not exists idx_payment_orders_order_id
  on public.payment_orders(order_id);

create index if not exists idx_payment_orders_status
  on public.payment_orders(status);

-- RLS untuk payment_orders
alter table public.payment_orders enable row level security;

-- Pengguna hanya dapat membaca riwayat pesanannya sendiri
drop policy if exists "Users can read own payment orders" on public.payment_orders;
create policy "Users can read own payment orders"
  on public.payment_orders for select
  using (auth.uid() = user_id);

-- Service role memiliki akses penuh untuk webhook & insert
drop policy if exists "Service role full access on payment_orders" on public.payment_orders;
create policy "Service role full access on payment_orders"
  on public.payment_orders for all
  using (true)
  with check (true);

-- 2. Tabel Log Pengiriman Notifikasi Transaksional (Resend API)
create table if not exists public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  notification_type text not null, -- 'VIEWED_BY_CLIENT', 'CHANGE_REQUESTED', 'AGREED_LOCKED', 'PAYMENT_SUCCESS'
  agreement_id text,
  status text not null default 'SENT', -- 'SENT', 'FAILED', 'MOCKED'
  error_message text,
  sent_at timestamptz default now()
);

create index if not exists idx_notifications_log_recipient
  on public.notifications_log(recipient_email, sent_at desc);

create index if not exists idx_notifications_log_agreement
  on public.notifications_log(agreement_id);

alter table public.notifications_log enable row level security;

drop policy if exists "Service role full access on notifications_log" on public.notifications_log;
create policy "Service role full access on notifications_log"
  on public.notifications_log for all
  using (true)
  with check (true);
-- ==============================================================================
-- Sepakatin â€” Migrasi 006: Penyelesaian Transaksi Pembayaran Atomik (Atomic Settlement)
-- Menghilangkan race condition & menjamin konsistensi ACID antara payment_orders dan profiles.
-- ==============================================================================

create or replace function public.settle_payment_order(
  p_order_id text,
  p_gateway_tx_id text default null,
  p_webhook_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '30 days';
  v_profile record;
  v_new_credits integer;
begin
  -- 1. Kunci baris order untuk update (Row-level lock) guna mencegah pemrosesan paralel
  select * into v_order
  from public.payment_orders
  where order_id = p_order_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'code', 'ORDER_NOT_FOUND',
      'message', 'Order tidak ditemukan'
    );
  end if;

  -- 2. Jika sudah PAID, kembalikan status idempotensi tanpa mengubah data lagi
  if v_order.status = 'PAID' then
    return jsonb_build_object(
      'success', true,
      'status', 'ALREADY_PAID',
      'order_id', v_order.order_id,
      'user_id', v_order.user_id,
      'package_type', v_order.package_type,
      'message', 'Order sudah lunas sebelumnya'
    );
  end if;

  -- 3. Kunci profil pengguna
  select * into v_profile
  from public.profiles
  where id = v_order.user_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'code', 'PROFILE_NOT_FOUND',
      'message', 'Profil pengguna tidak ditemukan'
    );
  end if;

  -- 4. Update status order menjadi PAID
  update public.payment_orders
  set
    status = 'PAID',
    paid_at = v_now,
    gateway_transaction_id = coalesce(p_gateway_tx_id, v_order.gateway_transaction_id),
    metadata = jsonb_set(
      coalesce(v_order.metadata, '{}'::jsonb),
      '{webhook_payload}',
      coalesce(p_webhook_payload, '{}'::jsonb)
    ),
    updated_at = v_now
  where id = v_order.id;

  -- 5. Berikan hak akses sesuai package_type secara atomik
  if v_order.package_type = 'credit_1' then
    v_new_credits := coalesce(v_profile.project_credits, 0) + 1;
    update public.profiles
    set
      project_credits = v_new_credits,
      updated_at = v_now
    where id = v_profile.id;
  elsif v_order.package_type = 'pro_monthly' then
    update public.profiles
    set
      plan = 'pro',
      plan_expires_at = v_expires_at,
      updated_at = v_now
    where id = v_profile.id;
  end if;

  return jsonb_build_object(
    'success', true,
    'status', 'SETTLED',
    'order_id', v_order.order_id,
    'user_id', v_order.user_id,
    'user_email', v_order.user_email,
    'package_type', v_order.package_type,
    'amount', v_order.amount,
    'paid_at', v_now
  );
end;
$$;

revoke all on function public.settle_payment_order(text, text, jsonb) from public, anon;
grant execute on function public.settle_payment_order(text, text, jsonb) to service_role;
