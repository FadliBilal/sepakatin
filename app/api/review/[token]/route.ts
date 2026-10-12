import { AgreementError, ClientAction, applyClientAction } from "@/lib/agreement-logic";
import { getByToken, handle, mutate, ok, readJson, toDetailItem } from "@/lib/server/repo";
import { clientIp, distributedRateLimit } from "@/lib/server/rate-limit";
import {
  notifyClientViewed,
  notifyChangeRequested,
  notifyAgreementConsensus,
} from "@/lib/server/notifications";

export const dynamic = "force-dynamic";

type Params = { params: { token: string } };

async function guardRate(req: Request, scope: string, limit: number, windowMs: number) {
  const { allowed, retryAfterSeconds } = await distributedRateLimit(`${scope}:${clientIp(req)}`, limit, windowMs);
  if (!allowed) {
    throw new AgreementError(
      `Terlalu banyak permintaan. Coba lagi dalam ${retryAfterSeconds} detik.`,
      429,
      "RATE_LIMITED"
    );
  }
}

export async function GET(req: Request, { params }: Params) {
  return handle(async () => {
    await guardRate(req, "review-get", 60, 60_000);
    const agreement = await getByToken(params.token);

    const content = agreement.currentVersion.contentJson;
    void notifyClientViewed({
      freelancerEmail: content.freelancer.email,
      freelancerName: content.freelancer.name,
      clientName: content.client.name,
      projectName: content.projectName,
      contractId: agreement.contractId,
      agreementId: agreement.id,
    }).catch(() => {});

    return ok({ agreement: toDetailItem(agreement) });
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
    await guardRate(req, "review-post", 15, 60_000);
    const action = await readJson<ClientAction>(req);
    const ctx = requestContext(req);
    const agreement = await mutate("review_token", params.token, (agr) => applyClientAction(agr, action, ctx));

    const content = agreement.currentVersion.contentJson;

    if (action.type === "requestChange") {
      void notifyChangeRequested({
        freelancerEmail: content.freelancer.email,
        freelancerName: content.freelancer.name,
        clientName: content.client.name,
        projectName: content.projectName,
        contractId: agreement.contractId,
        agreementId: agreement.id,
        changeTitle: action.title,
        changeDescription: action.description,
      }).catch(() => {});
    } else if (action.type === "approve" && agreement.status === "AGREED") {
      void notifyAgreementConsensus({
        freelancerEmail: content.freelancer.email,
        freelancerName: content.freelancer.name,
        clientEmail: content.client.email,
        clientName: content.client.name,
        projectName: content.projectName,
        contractId: agreement.contractId,
        agreementId: agreement.id,
      }).catch(() => {});
    }

    return ok({ agreement: toDetailItem(agreement) });
  });
}
