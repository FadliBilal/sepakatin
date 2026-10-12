import { AgreementError, OwnerAction, applyOwnerAction } from "@/lib/agreement-logic";
import { getOwned, handle, mutate, ok, readJson, requireUser, deleteOwned, toDetailItem } from "@/lib/server/repo";
import { uploadPdfToStorage, deletePdfFromStorage } from "@/lib/server/storage";
import { clientIp } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireUser(req);
    return ok({ agreement: toDetailItem(await getOwned(params.id, user.id)) });
  });
}

function requestContext(req: Request) {
  return {
    ipAddress: clientIp(req),
    userAgent: req.headers.get("user-agent") || undefined,
  };
}

export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireUser(req);
    const action = await readJson<OwnerAction>(req);
    const ctx = requestContext(req);

    if (action.type === "uploadStampedDocument" && action.fileUrl?.startsWith("data:application/pdf;base64,")) {
      try {
        const base64Data = action.fileUrl.slice("data:application/pdf;base64,".length).trim();
        const buffer = Buffer.from(base64Data, "base64");
        const { storagePath } = await uploadPdfToStorage({
          agreementId: params.id,
          copyType: action.copyType,
          buffer,
          fileName: action.fileName,
        });
        action.storagePath = storagePath;
        action.fileUrl = "";
        action.fileSize = buffer.length;
      } catch (err) {
        console.warn("Gagal simpan ke storage:", err);
      }
    }

    if (action.type === "removeStampedDocument") {
      try {
        const agreement = await getOwned(params.id, user.id);
        const doc = agreement.stampedDocuments?.find((d) => d.copyType === action.copyType);
        if (doc?.storagePath) {
          await deletePdfFromStorage(doc.storagePath);
        }
      } catch (err) {
        console.warn("Gagal menghapus dokumen storage:", err);
      }
    }

    const agreement = await mutate("id", params.id, async (agr, ownerId) => {
      if (ownerId !== user.id) throw new AgreementError("Kesepakatan tidak ditemukan.", 404, "NOT_FOUND");
      return applyOwnerAction(agr, action, ctx);
    });
    return ok({ agreement: toDetailItem(agreement) });
  });
}

export async function DELETE(req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireUser(req);
    const agr = await getOwned(params.id, user.id);
    if (agr.stampedDocuments) {
      for (const doc of agr.stampedDocuments) {
        if (doc.storagePath) {
          await deletePdfFromStorage(doc.storagePath).catch(() => {});
        }
      }
    }
    await deleteOwned(params.id, user.id);
    return ok({ success: true });
  });
}
