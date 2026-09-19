-- ==============================================================================
-- Sepakatin — Skema database Supabase
-- Jalankan sekali di Supabase Dashboard → SQL Editor → New query → Run.
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
