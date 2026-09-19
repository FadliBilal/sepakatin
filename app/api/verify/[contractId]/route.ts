import { toVerificationData } from "@/lib/agreement-logic";
import { getByContractId, handle, ok, toListItem } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

/** Cek keaslian publik — hanya ringkasan dan referensi dokumen. */
export async function GET(_req: Request, { params }: { params: { contractId: string } }) {
  return handle(async () => {
    const record = await getByContractId(params.contractId);
    return ok({
      verification: await toVerificationData(record),
      agreement: toListItem(record),
    });
  });
}

