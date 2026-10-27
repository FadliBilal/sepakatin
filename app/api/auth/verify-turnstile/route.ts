import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/server/turnstile";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const { allowed, retryAfterSeconds } = rateLimit(`turnstile-verify:${ip}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak permintaan. Coba lagi dalam ${retryAfterSeconds} detik.` },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { token?: string; action?: string };
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const action = typeof body.action === "string" ? body.action.trim() : undefined;

  const result = await verifyTurnstileToken(token, req, action);
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Verifikasi bot (Cloudflare Turnstile) gagal atau telah kedaluwarsa. Silakan muat ulang dan coba lagi.",
        errorCodes: result.errorCodes,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
