import { AgreementError, applyOwnerAction } from "@/lib/agreement-logic";
import { getOwned, handle, mutate, ok, requireUser, stampedDocumentOf, toDetailItem } from "@/lib/server/repo";
import { createSignedDownloadUrl, uploadPdfToStorage, MAX_PDF_SIZE_BYTES } from "@/lib/server/storage";
import { clientIp } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

function copyParam(req: Request): "freelancer_copy" | "client_copy" {
  const copy = new URL(req.url).searchParams.get("copy");
  if (copy !== "freelancer_copy" && copy !== "client_copy") {
    throw new AgreementError("Pilihan salinan dokumen tidak valid.");
  }
  return copy;
}

function requestContext(req: Request) {
  return {
    ipAddress: clientIp(req),
    userAgent: req.headers.get("user-agent") || undefined,
  };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const user = await requireUser(req);
    const agreement = await getOwned(params.id, user.id);
    const doc = stampedDocumentOf(agreement, copyParam(req));
    let downloadUrl = doc.fileUrl;
    if (doc.storagePath) {
      downloadUrl = await createSignedDownloadUrl(doc.storagePath, 900);
    }
    return ok({ document: { ...doc, fileUrl: downloadUrl } });
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const user = await requireUser(req);
    const formData = await req.formData();
    const file = formData.get("file");
    const copy = formData.get("copyType");
    const notes = formData.get("notes")?.toString() || undefined;

    if (!file || !(file instanceof Blob)) {
      throw new AgreementError("Berkas file PDF wajib diunggah.", 400);
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new AgreementError("Ukuran dokumen melebihi batas maksimum 15 MB.", 413, "FILE_TOO_LARGE");
    }
    if (copy !== "freelancer_copy" && copy !== "client_copy") {
      throw new AgreementError("Pilihan salinan dokumen tidak valid.", 400);
    }

    const fileName = (file instanceof File ? file.name : "dokumen-bermeterai.pdf") || "dokumen-bermeterai.pdf";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { storagePath } = await uploadPdfToStorage({
      agreementId: params.id,
      copyType: copy,
      buffer,
      fileName,
    });

    const ctx = requestContext(req);
    const updated = await mutate("id", params.id, async (agr, ownerId) => {
      if (ownerId !== user.id) throw new AgreementError("Kesepakatan tidak ditemukan.", 404, "NOT_FOUND");
      return applyOwnerAction(
        agr,
        {
          type: "uploadStampedDocument",
          copyType: copy,
          fileName,
          fileSize: buffer.length,
          storagePath,
          notes,
        },
        ctx
      );
    });

    return ok({ agreement: toDetailItem(updated), storagePath });
  });
}
