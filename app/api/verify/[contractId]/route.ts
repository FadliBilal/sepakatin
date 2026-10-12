import { AgreementError, toVerificationData } from "@/lib/agreement-logic";
import { getByContractId, handle, ok } from "@/lib/server/repo";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { contractId: string } }) {
  return handle(async () => {
    const { allowed, retryAfterSeconds } = rateLimit(`verify:${clientIp(req)}`, 30, 60_000);
    if (!allowed) {
      throw new AgreementError(
        `Terlalu banyak pengecekan. Coba lagi dalam ${retryAfterSeconds} detik.`,
        429,
        "RATE_LIMITED"
      );
    }
    const record = await getByContractId(params.contractId);
    const res = ok({
      verification: await toVerificationData(record),
    });
    if (["AGREED", "ACTIVE", "COMPLETED"].includes(record.status)) {
      res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
    }
    return res;
  });
}

