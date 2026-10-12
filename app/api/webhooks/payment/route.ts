import { NextResponse } from "next/server";
import crypto from "crypto";
import { settlePaymentOrder } from "@/lib/server/repo";
import { sendTransactionalEmail } from "@/lib/server/notifications";

export const dynamic = "force-dynamic";

function verifyWebhookSecret(req: Request): boolean {
  const configuredSecret = process.env.MAYAR_WEBHOOK_SECRET;

  if (!configuredSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Mayar Webhook] Error: MAYAR_WEBHOOK_SECRET belum dikonfigurasi.");
      return false;
    }
    return true;
  }

  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  const candidateToken =
    req.headers.get("x-mayar-token") ||
    req.headers.get("x-webhook-secret") ||
    req.headers.get("x-callback-token") ||
    bearerToken ||
    url.searchParams.get("token") ||
    url.searchParams.get("secret");

  if (!candidateToken) return false;

  const expectedBuffer = Buffer.from(configuredSecret);
  const candidateBuffer = Buffer.from(candidateToken);

  if (expectedBuffer.length !== candidateBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
}

export async function POST(req: Request) {
  try {
    if (!verifyWebhookSecret(req)) {
      return NextResponse.json({ error: "Unauthorized webhook request" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const data = body.data || body;

    const orderId =
      data.orderId ||
      data.order_id ||
      data.referenceId ||
      data.description?.match(/ORD-\d+-\d+/)?.[0];

    if (!orderId) {
      return NextResponse.json({ error: "Missing order identifier" }, { status: 400 });
    }

    const gatewayTxId = data.id || data.transactionId || null;
    const settlement = await settlePaymentOrder(orderId, gatewayTxId, data);

    if (settlement.status === "ALREADY_PAID") {
      return NextResponse.json({ success: true, message: "Order already paid", orderId });
    }

    const packageName =
      settlement.packageType === "credit_1"
        ? "1 Kredit Per Proyek (Rp19.000)"
        : "Paket Pro Bulanan (Rp49.000)";

    void sendTransactionalEmail({
      to: settlement.userEmail,
      subject: `[Sepakatin] Pembayaran Berhasil — ${packageName}`,
      html: `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f766e; margin-bottom: 8px;">Pembayaran Diterima</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Halo, pembayaran Anda sebesar <strong>Rp${Number(settlement.amount).toLocaleString("id-ID")}</strong> untuk <strong>${packageName}</strong> telah berhasil diproses secara otomatis via Mayar.id.
          </p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534;">
              Nomor Pesanan: <strong>${settlement.orderId}</strong><br>
              Status: <strong>AKTIF</strong>
            </p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
            Terima kasih telah menggunakan Sepakatin!
          </p>
        </div>
      `,
      notificationType: "PAYMENT_SUCCESS",
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      orderId: settlement.orderId,
      status: settlement.status,
    });
  } catch (err) {
    console.error("Error processing Mayar webhook:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
