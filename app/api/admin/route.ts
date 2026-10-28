import { AgreementError } from "@/lib/agreement-logic";
import { getAdmin } from "@/lib/server/supabase-admin";
import { getProfile, handle, isAdminEmail, ok, readJson, requireUser, settlePaymentOrder } from "@/lib/server/repo";
import { AgreementRecord, AdminAuditLogItem } from "@/lib/types";

export const dynamic = "force-dynamic";

async function requireAdmin(req: Request) {
  const user = await requireUser(req);
  const profile = await getProfile(user);
  if (!isAdminEmail(profile.email || user.email)) {
    throw new AgreementError("Hanya akun Administrator yang memiliki akses ke endpoint ini.", 403, "FORBIDDEN");
  }
  return { user, profile };
}

async function logAdminAction(params: {
  adminId: string;
  adminEmail: string;
  action: "UPDATE_PLAN" | "UPDATE_CREDITS" | "CANCEL_AGREEMENT" | "DELETE_AGREEMENT" | "DELETE_USER";
  targetType: "USER" | "AGREEMENT";
  targetId: string;
  details: Record<string, unknown>;
  req: Request;
}) {
  try {
    const forwarded = params.req.headers.get("x-forwarded-for") || "";
    const ipAddress = (forwarded.split(",")[0] || params.req.headers.get("x-real-ip") || "").trim() || undefined;
    const userAgent = params.req.headers.get("user-agent") || undefined;

    await getAdmin().from("admin_audit_logs").insert({
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      details: params.details,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Gagal mencatat jejak audit admin ke database:", err);
    }
  }
}

export async function GET(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const db = getAdmin();

    const [profilesRes, agreementsRes, auditRes, ordersRes] = await Promise.all([
      db.from("profiles").select("*").order("created_at", { ascending: false }),
      db.from("agreements").select("*").order("created_at", { ascending: false }),
      db.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
      db.from("payment_orders").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (agreementsRes.error) throw agreementsRes.error;

    const profiles = profilesRes.data || [];
    const agreementsRows = agreementsRes.data || [];
    const agreements: AgreementRecord[] = agreementsRows.map((r: { record: AgreementRecord; status: string }) => {
      const rec = r.record;
      return {
        ...rec,
        status: r.status as AgreementRecord["status"],
        // Optimasi: Kosongkan string base64 berat dari list admin agar respons JSON tetap super kencang & ringan
        signatures: (rec.signatures || []).map((s) => ({ ...s, signatureDataUrl: "" })),
        ematerai: rec.ematerai ? { ...rec.ematerai, imageUrl: "" } : undefined,
        emateraiList: (rec.emateraiList || []).map((e) => ({ ...e, imageUrl: "" })),
        stampedDocuments: (rec.stampedDocuments || []).map((d) => ({ ...d, fileUrl: "" })),
      };
    });

    const agreed = agreements.filter((a) => a.status === "AGREED" || a.status === "ACTIVE" || a.status === "COMPLETED").length;
    const pending = agreements.filter(
      (a) =>
        a.status === "PENDING_CLIENT" ||
        a.status === "CHANGES_REQUESTED" ||
        a.status === "PENDING_APPROVAL" ||
        a.status === "DRAFT"
    ).length;
    const cancelled = agreements.filter((a) => a.status === "CANCELLED" || a.status === "REJECTED").length;
    const totalValue = agreements
      .filter((a) => a.status !== "CANCELLED" && a.status !== "REJECTED")
      .reduce((sum, a) => sum + (Number(a.currentVersion?.contentJson?.payment?.totalValue) || 0), 0);

    const stats = {
      totalUsers: profiles.length,
      totalAgreements: agreements.length,
      totalAgreed: agreed,
      totalPending: pending,
      totalCancelled: cancelled,
      totalProjectValue: totalValue,
      isSupabaseConnected: true,
    };

    const users = profiles.map((p) => {
      const userAgrs = agreements.filter((a) => a.ownerId === p.id);
      const totalVal = userAgrs
        .filter((a) => a.status !== "CANCELLED")
        .reduce((sum, a) => sum + (Number(a.currentVersion?.contentJson?.payment?.totalValue) || 0), 0);

      return {
        id: p.id,
        username: (p.email || "").split("@")[0],
        email: p.email,
        fullName: p.full_name || p.email,
        role: p.skill || "Freelancer",
        phone: p.phone || "",
        plan: p.plan || "gratis",
        credits: p.project_credits || 0,
        agreementCount: userAgrs.length,
        totalValue: totalVal,
      };
    });

    const auditLogs: AdminAuditLogItem[] = (auditRes.data || []).map((log: {
      id: string;
      admin_id: string;
      admin_email: string;
      action: AdminAuditLogItem["action"];
      target_type: AdminAuditLogItem["targetType"];
      target_id: string;
      details: Record<string, unknown>;
      ip_address?: string;
      user_agent?: string;
      created_at: string;
    }) => ({
      id: log.id,
      adminId: log.admin_id,
      adminEmail: log.admin_email,
      action: log.action,
      targetType: log.target_type,
      targetId: log.target_id,
      details: log.details || {},
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
    }));

    const paymentOrders = (ordersRes.data || []).map((o: {
      id: string;
      order_id: string;
      user_id: string;
      user_email: string;
      package_type: string;
      amount: number;
      payment_method: string;
      payment_gateway: string;
      status: string;
      paid_at?: string;
      created_at: string;
      metadata?: Record<string, unknown>;
    }) => {
      const userProfile = profiles.find(
        (p) => p.id === o.user_id || (p.email && p.email.toLowerCase() === o.user_email?.toLowerCase())
      );
      const meta = (o.metadata || {}) as Record<string, unknown>;
      return {
        id: o.id,
        orderId: o.order_id,
        userId: o.user_id,
        userEmail: o.user_email,
        userName: userProfile?.full_name || (typeof meta.profile_name === "string" ? meta.profile_name : "") || o.user_email,
        userPhone: userProfile?.phone || (typeof meta.user_phone === "string" ? meta.user_phone : "") || "",
        packageType: o.package_type,
        amount: o.amount,
        paymentMethod: o.payment_method,
        paymentGateway: o.payment_gateway,
        status: o.status,
        paidAt: o.paid_at,
        metadata: o.metadata,
        createdAt: o.created_at,
      };
    });

    return ok({ stats, users, agreements, auditLogs, paymentOrders });
  });
}

export async function PATCH(req: Request) {
  return handle(async () => {
    const { user, profile } = await requireAdmin(req);
    const db = getAdmin();
    const body = await readJson<{
      action: string;
      userId?: string;
      orderId?: string;
      plan?: string;
      credits?: number;
    }>(req);

    if (body.action === "updatePlan" && body.userId && body.plan) {
      const expiresAt =
        body.plan === "pro"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;
      const { error } = await db
        .from("profiles")
        .update({
          plan: body.plan,
          plan_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.userId);
      if (error) throw error;

      await logAdminAction({
        adminId: user.id,
        adminEmail: profile.email || user.email || "admin@sepakatin.id",
        action: "UPDATE_PLAN",
        targetType: "USER",
        targetId: body.userId,
        details: { plan: body.plan },
        req,
      });

      return ok({ success: true, message: `Paket berhasil diubah menjadi ${body.plan}` });
    }

    if (body.action === "updateCredits" && body.userId && typeof body.credits === "number") {
      const { error } = await db.from("profiles").update({ project_credits: body.credits, updated_at: new Date().toISOString() }).eq("id", body.userId);
      if (error) throw error;

      await logAdminAction({
        adminId: user.id,
        adminEmail: profile.email || user.email || "admin@sepakatin.id",
        action: "UPDATE_CREDITS",
        targetType: "USER",
        targetId: body.userId,
        details: { credits: body.credits },
        req,
      });

      return ok({ success: true, message: `Kredit berhasil diubah menjadi ${body.credits}` });
    }

    if (body.action === "approveOrder" && body.orderId) {
      const settlement = await settlePaymentOrder(body.orderId, "MANUAL_APPROVAL", { manual_admin_id: user.id });

      await logAdminAction({
        adminId: user.id,
        adminEmail: profile.email || user.email || "admin@sepakatin.id",
        action: "UPDATE_CREDITS",
        targetType: "USER",
        targetId: settlement.userId,
        details: { orderId: settlement.orderId, packageType: settlement.packageType, manualApproval: true },
        req,
      });

      return ok({ success: true, message: `Pesanan ${settlement.orderId} berhasil diverifikasi manual.` });
    }

    if (body.action === "rejectOrder" && body.orderId) {
      await db.from("payment_orders").update({ status: "FAILED", updated_at: new Date().toISOString() }).eq("order_id", body.orderId);
      return ok({ success: true, message: `Pesanan ${body.orderId} telah ditolak.` });
    }

    throw new AgreementError("Aksi tidak valid.");
  });
}

export async function DELETE(req: Request) {
  return handle(async () => {
    const { user, profile } = await requireAdmin(req);
    const db = getAdmin();
    const body = await readJson<{ action: string; agreementId?: string; userId?: string }>(req);

    if (body.action === "deleteUser" && body.userId) {
      if (body.userId === user.id) {
        throw new AgreementError("Anda tidak dapat menghapus akun administrator Anda sendiri.", 400);
      }

      const { data: targetProfile } = await db.from("profiles").select("email").eq("id", body.userId).maybeSingle();
      if (targetProfile && isAdminEmail(targetProfile.email)) {
        throw new AgreementError("Akun sesama administrator tidak dapat dihapus.", 403);
      }

      // Hapus user di Supabase Auth (secara otomatis cascade ke profiles, agreements, dsb.)
      const { error: deleteAuthError } = await db.auth.admin.deleteUser(body.userId);
      if (deleteAuthError) throw deleteAuthError;

      await logAdminAction({
        adminId: user.id,
        adminEmail: profile.email || user.email || "admin@sepakatin.id",
        action: "DELETE_USER",
        targetType: "USER",
        targetId: body.userId,
        details: { targetEmail: targetProfile?.email || "unknown" },
        req,
      });

      return ok({ success: true, message: "Pengguna berhasil dihapus secara permanen." });
    }

    if (body.action === "cancel" && body.agreementId) {
      const { error } = await db.from("agreements").update({ status: "CANCELLED", updated_at: new Date().toISOString() }).eq("id", body.agreementId);
      if (error) throw error;

      await logAdminAction({
        adminId: user.id,
        adminEmail: profile.email || user.email || "admin@sepakatin.id",
        action: "CANCEL_AGREEMENT",
        targetType: "AGREEMENT",
        targetId: body.agreementId,
        details: { status: "CANCELLED" },
        req,
      });

      return ok({ success: true, message: "Kesepakatan berhasil dibatalkan." });
    }

    if (body.action === "delete" && body.agreementId) {
      const { error } = await db.from("agreements").delete().eq("id", body.agreementId);
      if (error) throw error;

      await logAdminAction({
        adminId: user.id,
        adminEmail: profile.email || user.email || "admin@sepakatin.id",
        action: "DELETE_AGREEMENT",
        targetType: "AGREEMENT",
        targetId: body.agreementId,
        details: { deleted: true },
        req,
      });

      return ok({ success: true, message: "Kesepakatan berhasil dihapus." });
    }

    throw new AgreementError("Aksi tidak valid.");
  });
}
