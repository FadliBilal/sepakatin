-- ==============================================================================
-- Sepakatin — Migrasi 005: Transaksi Pembayaran (Mayar.id/QRIS) & Log Notifikasi
-- Jalankan di Supabase Dashboard → SQL Editor → Run.
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
