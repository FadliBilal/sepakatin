import { AgreementError } from "@/lib/agreement-logic";
import { getAdmin } from "@/lib/server/supabase-admin";
import { getProfile, handle, ok, readJson, requireUser } from "@/lib/server/repo";
import { AgreementRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

async function requireAdmin(req: Request) {
  const user = await requireUser(req);
  const profile = await getProfile(user);
  const isAdmin =
    profile.skill?.toLowerCase() === "admin" ||
    profile.email?.toLowerCase().startsWith("admin@") ||
    profile.email?.toLowerCase() === "admin@sepakatin.id";

  if (!isAdmin) {
    throw new AgreementError("Hanya akun Administrator yang memiliki akses ke endpoint ini.", 403, "FORBIDDEN");
  }
  return { user, profile };
}

export async function GET(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const db = getAdmin();

    const [profilesRes, agreementsRes] = await Promise.all([
      db.from("profiles").select("*").order("created_at", { ascending: false }),
      db.from("agreements").select("*").order("created_at", { ascending: false }),
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (agreementsRes.error) throw agreementsRes.error;

    const profiles = profilesRes.data || [];
    const agreementsRows = agreementsRes.data || [];
    const agreements: AgreementRecord[] = agreementsRows.map((r: { record: AgreementRecord; status: string }) => ({
      ...r.record,
      status: r.status as AgreementRecord["status"],
    }));

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

    return ok({ stats, users, agreements });
  });
}

export async function PATCH(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const db = getAdmin();
    const body = await readJson<{ action: string; userId: string; plan?: string; credits?: number }>(req);

    if (body.action === "updatePlan" && body.plan) {
      const { error } = await db.from("profiles").update({ plan: body.plan, updated_at: new Date().toISOString() }).eq("id", body.userId);
      if (error) throw error;
      return ok({ success: true, message: `Paket berhasil diubah menjadi ${body.plan}` });
    }

    if (body.action === "updateCredits" && typeof body.credits === "number") {
      const { error } = await db.from("profiles").update({ project_credits: body.credits, updated_at: new Date().toISOString() }).eq("id", body.userId);
      if (error) throw error;
      return ok({ success: true, message: `Kredit berhasil diubah menjadi ${body.credits}` });
    }

    throw new AgreementError("Aksi tidak valid.");
  });
}

export async function DELETE(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const db = getAdmin();
    const body = await readJson<{ action: string; agreementId: string }>(req);

    if (body.action === "cancel") {
      const { error } = await db.from("agreements").update({ status: "CANCELLED", updated_at: new Date().toISOString() }).eq("id", body.agreementId);
      if (error) throw error;
      return ok({ success: true, message: "Kesepakatan berhasil dibatalkan." });
    }

    if (body.action === "delete") {
      const { error } = await db.from("agreements").delete().eq("id", body.agreementId);
      if (error) throw error;
      return ok({ success: true, message: "Kesepakatan berhasil dihapus." });
    }

    throw new AgreementError("Aksi tidak valid.");
  });
}
