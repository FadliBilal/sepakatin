import { handle, ok, requireUser, getProfile, getAdmin } from "@/lib/server/repo";
import { createMayarPayment } from "@/lib/server/mayar";
import { PaymentPackageType } from "@/lib/types";
import { appUrl } from "@/lib/app-url";
import { extractIdempotencyKey, runWithIdempotency } from "@/lib/server/idempotency";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser(req);
    const profile = await getProfile(user);
    const body = (await req.json().catch(() => ({}))) as { packageType?: PaymentPackageType };
    const idempotencyKey = extractIdempotencyKey(req);

    const packageType: PaymentPackageType =
      body.packageType === "pro_monthly" ? "pro_monthly" : "credit_1";

    const result = await runWithIdempotency({
      key: idempotencyKey,
      scope: `${user.id}::checkout`,
      payload: { packageType },
      execute: async () => {
        const amount = packageType === "credit_1" ? 19000 : 49000;
        const orderId = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const db = getAdmin();

        try {
          await db.from("payment_orders").insert({
            order_id: orderId,
            user_id: profile.id,
            user_email: profile.email || user.email || "",
            package_type: packageType,
            amount,
            payment_method: "QRIS",
            payment_gateway: "MAYAR",
            status: "PENDING",
            metadata: { profile_name: profile.full_name },
          });
        } catch (err) {
          console.warn("Gagal mencatat order:", err);
        }

        const redirectUrl = `${appUrl()}/dashboard?payment_success=${orderId}`;
        const paymentResult = await createMayarPayment({
          orderId,
          packageType,
          amount,
          userName: profile.full_name,
          userEmail: profile.email || user.email || "",
          redirectUrl,
        });

        if (paymentResult.paymentUrl) {
          try {
            await db
              .from("payment_orders")
              .update({
                payment_url: paymentResult.paymentUrl,
                gateway_transaction_id: paymentResult.gatewayTransactionId || null,
              })
              .eq("order_id", orderId);
          } catch {
            // ignore
          }
        }

        const uniqueCode = Math.floor(100 + Math.random() * 899);
        return {
          status: 200,
          body: {
            orderId,
            packageType,
            amount,
            uniqueCode,
            totalAmount: amount + uniqueCode,
            paymentUrl: paymentResult.paymentUrl,
            qrCodeUrl: paymentResult.qrCodeUrl,
            gatewayTransactionId: paymentResult.gatewayTransactionId,
            isSandbox: paymentResult.isSandbox,
          },
        };
      },
    });

    return ok(result.body, result.status);
  });
}
