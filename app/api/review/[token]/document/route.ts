import { AgreementError } from "@/lib/agreement-logic";
import { getByToken, handle, ok, stampedDocumentOf } from "@/lib/server/repo";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { createSignedDownloadUrl } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  return handle(async () => {
    const { allowed, retryAfterSeconds } = rateLimit(`review-doc:${clientIp(req)}`, 20, 60_000);
    if (!allowed) {
      throw new AgreementError(
        `Terlalu banyak permintaan unduhan. Coba lagi dalam ${retryAfterSeconds} detik.`,
        429,
        "RATE_LIMITED"
      );
    }
    const agreement = await getByToken(params.token);
    const doc = stampedDocumentOf(agreement, "client_copy");
    let downloadUrl = doc.fileUrl;
    if (doc.storagePath) {
      downloadUrl = await createSignedDownloadUrl(doc.storagePath, 900);
    }
    return ok({ document: { ...doc, fileUrl: downloadUrl } });
  });
}
