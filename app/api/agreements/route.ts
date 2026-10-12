import { createForUser, handle, listOwned, ok, readJson, requireUser, toListItem } from "@/lib/server/repo";
import { extractIdempotencyKey, runWithIdempotency } from "@/lib/server/idempotency";
import type { ContractContentJSON } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireUser(req);
    const list = await listOwned(user.id);
    return ok({ agreements: list.map(toListItem) });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser(req);
    const body = await readJson<{ content: ContractContentJSON; sendDirectly?: boolean; useCredit?: boolean }>(req);
    const idempotencyKey = extractIdempotencyKey(req);

    const result = await runWithIdempotency({
      key: idempotencyKey,
      scope: `${user.id}::create_agreement`,
      payload: body,
      execute: async () => {
        const agreement = await createForUser(user, body);
        return { status: 201, body: { agreement } };
      },
    });

    return ok(result.body, result.status);
  });
}
