import { AgreementError, OwnerAction, applyOwnerAction } from "@/lib/agreement-logic";
import { getOwned, handle, mutate, ok, readJson, requireUser } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireUser(req);
    return ok({ agreement: await getOwned(params.id, user.id) });
  });
}

/** Aksi freelancer: kirim, setujui, ubah versi, e-Materai, tanda tangan, selesai, batal. */
export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireUser(req);
    const action = await readJson<OwnerAction>(req);
    const agreement = await mutate("id", params.id, async (agr, ownerId) => {
      if (ownerId !== user.id) throw new AgreementError("Kesepakatan tidak ditemukan.", 404, "NOT_FOUND");
      return applyOwnerAction(agr, action);
    });
    return ok({ agreement });
  });
}
