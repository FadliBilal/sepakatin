import { handle, ok, requireUser, getAdmin, isAdminEmail } from "@/lib/server/repo";
import { sendTransactionalEmail } from "@/lib/server/notifications";
import { AgreementError } from "@/lib/agreement-logic";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser(req);
    const userIsAdmin = isAdminEmail(user.email);

    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_PAYMENT_SIMULATION !== "true" &&
      !userIsAdmin
    ) {
      throw new AgreementError(
        "Simulasi pembayaran otomatis sandbox di lingkungan produksi dinonaktifkan demi keamanan transaksi. Silakan hubungi admin via WhatsApp untuk aktivasi paket Anda.",
        403,
        "SIMULATION_DISABLED"
      );
    }

    const body = (await req.json().catch(() => ({}))) as { orderId?: string };

    if (!body.orderId) {
      throw new Error("orderId is required");
    }

    const db = getAdmin();

    const { data: order, error } = await db
      .from("payment_orders")
      .select("*")
      .eq("order_id", body.orderId)
      .single();

    if (error || !order) {
      throw new Error("Pesanan tidak ditemukan");
    }

    if (order.user_id !== user.id) {
      throw new Error("Akses ditolak: bukan pesanan Anda");
    }

    if (order.status === "PAID") {
      return ok({ success: true, message: "Pesanan sudah berstatus lunas" });
    }

    const now = new Date().toISOString();

    await db
      .from("payment_orders")
      .update({
        status: "PAID",
        paid_at: now,
        gateway_transaction_id: `SIMULATED-${Date.now()}`,
        updated_at: now,
      })
      .eq("id", order.id);

    const { data: profile } = await db
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      if (order.package_type === "credit_1") {
        const currentCredits = Number(profile.project_credits) || 0;
        await db
          .from("profiles")
          .update({
            project_credits: currentCredits + 1,
            updated_at: now,
          })
          .eq("id", profile.id);
      } else if (order.package_type === "pro_monthly") {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await db
          .from("profiles")
          .update({
            plan: "pro",
            plan_expires_at: expiresAt,
            updated_at: now,
          })
          .eq("id", profile.id);
      }

      const packageName =
        order.package_type === "credit_1"
          ? "1 Kredit Per Proyek (Rp19.000)"
          : "Paket Pro Bulanan (Rp49.000)";

      await sendTransactionalEmail({
        to: profile.email || user.email || "",
        subject: `[Sepakatin - Sandbox] Pembayaran Berhasil — ${packageName}`,
        html: `
          <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f766e; margin-bottom: 8px;">Pembayaran Sandbox Berhasil</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Halo <strong>${profile.full_name || "Pengguna"}</strong>, simulasi pembayaran sebesar <strong>Rp${Number(order.amount).toLocaleString("id-ID")}</strong> untuk <strong>${packageName}</strong> telah berhasil diproses.
            </p>
            <p style="font-size: 12px; color: #64748b;">Nomor Pesanan: ${order.order_id}</p>
          </div>
        `,
        notificationType: "PAYMENT_SUCCESS",
      });
    }

    return ok({
      success: true,
      message: "Simulasi pembayaran berhasil! Akun Anda telah otomatis diaktifkan.",
      orderId: order.order_id,
      packageType: order.package_type,
    });
  });
}
