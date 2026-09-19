import { createForUser, handle, listOwned, ok, readJson, requireUser, toListItem } from "@/lib/server/repo";
import type { ContractContentJSON } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Daftar kesepakatan milik akun yang sedang masuk. */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireUser(req);
    const list = await listOwned(user.id);
    return ok({ agreements: list.map(toListItem) });
  });
}

/** Membuat kesepakatan baru (batas paket dicek di sini dan di database). */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser(req);
    const body = await readJson<{ content: ContractContentJSON; sendDirectly?: boolean; useCredit?: boolean }>(req);
    const agreement = await createForUser(user, body);
    return ok({ agreement }, 201);
  });
}
