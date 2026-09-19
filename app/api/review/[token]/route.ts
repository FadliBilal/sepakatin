import { ClientAction, applyClientAction } from "@/lib/agreement-logic";
import { getByToken, handle, mutate, ok, readJson } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

type Params = { params: { token: string } };

/** Klien membuka kesepakatan lewat link undangan (tanpa akun). */
export async function GET(_req: Request, { params }: Params) {
  return handle(async () => ok({ agreement: await getByToken(params.token) }));
}

/** Aksi klien: setujui, minta perubahan, tanda tangan. */
export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const action = await readJson<ClientAction>(req);
    const agreement = await mutate("review_token", params.token, (agr) => applyClientAction(agr, action));
    return ok({ agreement });
  });
}
