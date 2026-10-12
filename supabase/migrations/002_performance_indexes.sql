-- ==============================================================================
-- Sepakatin — Migrasi 002: Indeks Performa & Skalabilitas Database
-- Jalankan di Supabase Dashboard → SQL Editor → Run.
-- ==============================================================================

-- 1. Mempercepat query filter status kesepakatan (Dashboard Freelancer & Admin)
create index if not exists idx_agreements_status on public.agreements (status);

-- 2. Mempercepat sorting kesepakatan terbaru secara global
create index if not exists idx_agreements_created_at on public.agreements (created_at desc);

-- 3. Mempercepat query kesepakatan per owner dan status aktif
create index if not exists idx_agreements_owner_status on public.agreements (owner_id, status);

-- 4. Mempercepat sorting profil pengguna di dashboard admin
create index if not exists idx_profiles_created_at on public.profiles (created_at desc);
