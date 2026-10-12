import { getAdmin } from "./supabase-admin";
import { AgreementError } from "@/lib/agreement-logic";

export const STORAGE_BUCKET = "agreement-documents";
export const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024;

export function isStorageConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Validasi Magic Bytes PDF (%PDF-)
export function verifyPdfMagicBytes(buffer: Buffer | Uint8Array): boolean {
  if (!buffer || buffer.length < 5) return false;
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

export async function uploadPdfToStorage(params: {
  agreementId: string;
  copyType: "freelancer_copy" | "client_copy";
  buffer: Buffer;
  fileName?: string;
}): Promise<{ storagePath: string }> {
  if (params.buffer.length > MAX_PDF_SIZE_BYTES) {
    throw new AgreementError(
      `Ukuran dokumen melebihi batas maksimum 15 MB (${(params.buffer.length / (1024 * 1024)).toFixed(1)} MB).`,
      413,
      "FILE_TOO_LARGE"
    );
  }

  if (!verifyPdfMagicBytes(params.buffer)) {
    throw new AgreementError(
      "Berkas dokumen yang diunggah bukan dokumen PDF asli yang terverifikasi.",
      400,
      "INVALID_FILE"
    );
  }

  const storagePath = `agreements/${params.agreementId}/${params.copyType}.pdf`;
  const admin = getAdmin();

  const { error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, params.buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Supabase Storage Upload Error:", error);
    throw new AgreementError(
      `Gagal menyimpan berkas ke Supabase Storage: ${error.message}`,
      500,
      "STORAGE_ERROR"
    );
  }

  return { storagePath };
}

export async function createSignedDownloadUrl(
  storagePath: string,
  expiresInSeconds: number = 900
): Promise<string> {
  const admin = getAdmin();
  const cleanPath = storagePath.replace(/^storage:\/\/agreement-documents\//, "").replace(/^agreement-documents\//, "");

  const { data, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(cleanPath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error("Supabase Storage Signed URL Error:", error);
    throw new AgreementError(
      "Gagal menerbitkan tautan unduh dokumen yang aman.",
      500,
      "STORAGE_ERROR"
    );
  }

  return data.signedUrl;
}

export async function deletePdfFromStorage(storagePath: string): Promise<void> {
  if (!storagePath) return;
  const admin = getAdmin();
  const cleanPath = storagePath.replace(/^storage:\/\/agreement-documents\//, "").replace(/^agreement-documents\//, "");

  const { error } = await admin.storage.from(STORAGE_BUCKET).remove([cleanPath]);
  if (error) {
    console.warn("Gagal menghapus berkas dari Supabase Storage:", error.message);
  }
}

export async function downloadPdfBuffer(storagePath: string): Promise<Buffer | null> {
  const admin = getAdmin();
  const cleanPath = storagePath.replace(/^storage:\/\/agreement-documents\//, "").replace(/^agreement-documents\//, "");

  const { data, error } = await admin.storage.from(STORAGE_BUCKET).download(cleanPath);
  if (error || !data) return null;

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
