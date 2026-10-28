import { getAdmin } from "@/lib/server/supabase-admin";
import { appUrl } from "@/lib/app-url";

export type NotificationType =
  | "VIEWED_BY_CLIENT"
  | "CHANGE_REQUESTED"
  | "AGREED_LOCKED"
  | "PAYMENT_SUCCESS";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  notificationType: NotificationType;
  agreementId?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Sepakatin <notifikasi@sepakatin.my.id>";

function getDbSafe() {
  try {
    return getAdmin();
  } catch {
    return null;
  }
}

// Kirim email transaksional via Resend API
export async function sendTransactionalEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string }> {
  const db = getDbSafe();

  // Mock Mode jika belum ada API Key Resend
  if (!RESEND_API_KEY || RESEND_API_KEY.startsWith("mock_") || RESEND_API_KEY === "demo_key") {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Resend MOCKED] To: ${params.to} | Subject: "${params.subject}" | Type: ${params.notificationType}`
      );
    }

    if (db) {
      try {
        await db.from("notifications_log").insert({
          recipient_email: params.to,
          notification_type: params.notificationType,
          agreement_id: params.agreementId || null,
          status: "MOCKED",
          sent_at: new Date().toISOString(),
        });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Gagal menyimpan mock notifications_log:", err);
        }
      }
    }

    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Resend API returned error:", data);
      }
      if (db) {
        await db.from("notifications_log").insert({
          recipient_email: params.to,
          notification_type: params.notificationType,
          agreement_id: params.agreementId || null,
          status: "FAILED",
          error_message: JSON.stringify(data),
          sent_at: new Date().toISOString(),
        });
      }
      return { success: false };
    }

    if (db) {
      await db.from("notifications_log").insert({
        recipient_email: params.to,
        notification_type: params.notificationType,
        agreement_id: params.agreementId || null,
        status: "SENT",
        sent_at: new Date().toISOString(),
      });
    }

    return { success: true, id: data.id };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Gagal mengirim email via Resend:", error);
    }
    if (db) {
      try {
        await db.from("notifications_log").insert({
          recipient_email: params.to,
          notification_type: params.notificationType,
          agreement_id: params.agreementId || null,
          status: "FAILED",
          error_message: error instanceof Error ? error.message : "Network error",
          sent_at: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }
    return { success: false };
  }
}

// Pemicu notifikasi email transaksi
const recentViewNotifications = new Map<string, number>();
const VIEW_NOTIFICATION_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 jam jeda

export async function notifyClientViewed(params: {
  freelancerEmail: string;
  freelancerName: string;
  clientName: string;
  projectName: string;
  contractId: string;
  agreementId: string;
}) {
  const lastSent = recentViewNotifications.get(params.agreementId) || 0;
  const now = Date.now();
  if (now - lastSent < VIEW_NOTIFICATION_COOLDOWN_MS) {
    // Lewati pengiriman agar tidak spam ke inbox freelancer saat klien refresh
    return { success: true };
  }
  recentViewNotifications.set(params.agreementId, now);

  const url = `${appUrl()}/agreements/${params.agreementId}`;
  const html = `
    <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #0f766e; margin-bottom: 8px;">Draf Anda Sedang Ditinjau Klien</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Halo <strong>${params.freelancerName}</strong>, klien Anda <strong>${params.clientName}</strong> baru saja membuka dan meninjau surat kesepakatan untuk proyek <strong>"${params.projectName}"</strong> (${params.contractId}).
      </p>
      <div style="margin: 24px 0;">
        <a href="${url}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; font-size: 14px; display: inline-block;">
          Lihat Dokumen di Sepakatin
        </a>
      </div>
      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        Notifikasi otomatis resmi dari Sepakatin · Mengamankan kesepakatan freelance Anda.
      </p>
    </div>
  `;

  return sendTransactionalEmail({
    to: params.freelancerEmail,
    subject: `[Sepakatin] ${params.clientName} sedang meninjau kesepakatan ${params.contractId}`,
    html,
    notificationType: "VIEWED_BY_CLIENT",
    agreementId: params.agreementId,
  });
}

export async function notifyChangeRequested(params: {
  freelancerEmail: string;
  freelancerName: string;
  clientName: string;
  projectName: string;
  contractId: string;
  agreementId: string;
  changeTitle: string;
  changeDescription: string;
}) {
  const url = `${appUrl()}/agreements/${params.agreementId}`;
  const html = `
    <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #b45309; margin-bottom: 8px;">Permintaan Perubahan dari Klien</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Halo <strong>${params.freelancerName}</strong>, klien Anda <strong>${params.clientName}</strong> mengajukan permintaan revisi untuk kesepakatan <strong>${params.contractId}</strong>:
      </p>
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin: 16px 0;">
        <p style="font-weight: bold; margin: 0 0 6px 0; font-size: 14px; color: #92400e;">${params.changeTitle}</p>
        <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.5;">${params.changeDescription}</p>
      </div>
      <div style="margin: 24px 0;">
        <a href="${url}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; font-size: 14px; display: inline-block;">
          Tindak Lanjuti di Sepakatin
        </a>
      </div>
      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        Notifikasi otomatis resmi dari Sepakatin.
      </p>
    </div>
  `;

  return sendTransactionalEmail({
    to: params.freelancerEmail,
    subject: `[Sepakatin] Permintaan Revisi Baru dari ${params.clientName} (${params.contractId})`,
    html,
    notificationType: "CHANGE_REQUESTED",
    agreementId: params.agreementId,
  });
}

export async function notifyAgreementConsensus(params: {
  freelancerEmail: string;
  freelancerName: string;
  clientEmail: string;
  clientName: string;
  projectName: string;
  contractId: string;
  agreementId: string;
}) {
  const url = `${appUrl()}/agreements/${params.agreementId}/print`;
  const verifyUrl = `${appUrl()}/verify/${params.contractId}`;

  const html = `
    <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #059669; margin-bottom: 8px;">Kesepakatan Resmi Disepakati & Sah</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Selamat! Kedua belah pihak (<strong>${params.freelancerName}</strong> & <strong>${params.clientName}</strong>) telah menandatangani dan menyetujui surat kesepakatan untuk proyek <strong>"${params.projectName}"</strong> (${params.contractId}).
      </p>
      <p style="font-size: 13px; color: #475569; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; border-radius: 8px;">
        Dokumen ini telah sah mengikat secara hukum perdata (Pasal 1320 KUHPerdata & UU ITE No. 1/2024). Pekerjaan proyek dapat segera dimulai!
      </p>
      <div style="margin: 24px 0; display: flex; gap: 12px;">
        <a href="${url}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; font-size: 14px; display: inline-block;">
          Unduh Salinan PDF
        </a>
      </div>
      <p style="font-size: 12px; color: #64748b;">
        Cek keaslian publik: <a href="${verifyUrl}" style="color: #0f766e;">${verifyUrl}</a>
      </p>
    </div>
  `;

  // Kirim ke freelancer
  await sendTransactionalEmail({
    to: params.freelancerEmail,
    subject: `[Sepakatin] Kesepakatan Sah: Proyek "${params.projectName}" (${params.contractId})`,
    html,
    notificationType: "AGREED_LOCKED",
    agreementId: params.agreementId,
  });

  // Kirim juga ke klien
  if (params.clientEmail && params.clientEmail !== params.freelancerEmail) {
    await sendTransactionalEmail({
      to: params.clientEmail,
      subject: `[Sepakatin] Salinan Dokumen Sah: Proyek "${params.projectName}" (${params.contractId})`,
      html,
      notificationType: "AGREED_LOCKED",
      agreementId: params.agreementId,
    });
  }
}
