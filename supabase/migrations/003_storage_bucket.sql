-- ==============================================================================
-- Sepakatin — Migrasi 003: Arsitektur Supabase Storage untuk Dokumen Kontrak
-- Bucket: 'agreement-documents' (Private / Terproteksi)
-- Menghentikan penyimpanan string Base64 PDF di kolom agreements.record JSONB.
-- Jalankan di Supabase Dashboard → SQL Editor → Run.
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
