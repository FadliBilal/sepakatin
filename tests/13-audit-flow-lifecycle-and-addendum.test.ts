import assert from "node:assert";
import {
  applyClientAction,
  applyOwnerAction,
  buildNewAgreement,
  toVerificationData,
} from "../lib/agreement-logic";
import { isActiveStatus } from "../lib/plans";
import { ContractContentJSON } from "../lib/types";

export async function runTest13() {
  console.log("\n🚀 [FITUR 13] UNIT TEST: Siklus Hidup Alur Kerja, Mulai Pengerjaan, Penolakan & Addendum");

  const sampleContent: ContractContentJSON = {
    projectName: "Pengembangan Web App E-Commerce",
    freelancer: {
      name: "Fadli Bilal",
      email: "fadli@example.com",
      phone: "08123456789",
      role: "Full-stack Engineer",
    },
    client: {
      name: "Budi Santoso",
      email: "budi@client.id",
      phone: "08987654321",
      company: "PT Maju Terus",
    },
    scope: {
      description: "Pembuatan aplikasi e-commerce dari tahap perancangan sampai deployment.",
      deliverables: ["Desain UI/UX", "Backend API", "Frontend Web"],
      exclusions: ["Biaya hosting & domain"],
    },
    payment: {
      totalValue: 12000000,
      currency: "IDR",
      dpPercent: 50,
      milestones: [
        { title: "DP 50%", amount: 6000000 },
        { title: "Pelunasan 50%", amount: 6000000 },
      ],
      finalPaymentDueDays: 7,
    },
    revision: {
      count: 2,
      extraRevisionRate: 500000,
    },
    timeline: {
      startDate: "2026-11-01",
      deadline: "2026-12-01",
    },
    ip: {
      ownershipClause: "Hak cipta beralih ke klien setelah pelunasan 100%.",
    },
    termination: {
      cancellationCondition: "Pembatalan sepihak wajib membayar pekerjaan yang sudah selesai.",
      noticePeriodDays: 7,
    },
  };

  // Skenario 1: Mulai Pengerjaan (AGREED -> ACTIVE)
  {
    const agreement = await buildNewAgreement({
      content: sampleContent,
      contractId: "SPK-2026-FLOW1",
      ownerId: "user-1",
      plan: "pro",
      sendDirectly: true,
    });

    // Freelancer setuju
    let agr = await applyOwnerAction(agreement, { type: "approve" });
    // Klien setuju -> status otomatis AGREED
    agr = await applyClientAction(agr, {
      type: "approve",
      name: "Budi Santoso",
      email: "budi@client.id",
    });
    assert.strictEqual(agr.status, "AGREED", "Status harus AGREED setelah kedua pihak setuju.");
    assert.strictEqual(isActiveStatus(agr.status), true, "Status AGREED harus dihitung aktif.");

    // Freelancer menekan Mulai Pengerjaan -> ACTIVE
    agr = await applyOwnerAction(agr, { type: "startWork" });
    assert.strictEqual(agr.status, "ACTIVE", "Status harus berubah menjadi ACTIVE setelah startWork.");
    assert.strictEqual(isActiveStatus(agr.status), true, "Status ACTIVE harus tetap dihitung aktif.");

    const startedLog = agr.activityLogs.find((l) => l.eventType === "STARTED");
    assert.ok(startedLog, "Harus tercatat log aktivitas dengan eventType 'STARTED'.");
    console.log("  ✓ 13.1 Berhasil transisi AGREED -> ACTIVE melalui aksi startWork dengan audit log resmi.");
  }

  // Skenario 2: Penolakan Klien (PENDING_CLIENT -> REJECTED)
  {
    const agreement = await buildNewAgreement({
      content: sampleContent,
      contractId: "SPK-2026-FLOW2",
      ownerId: "user-1",
      plan: "gratis",
      sendDirectly: true,
    });

    assert.strictEqual(agreement.status, "PENDING_CLIENT");
    assert.strictEqual(isActiveStatus(agreement.status), true);

    const rejectedAgr = await applyClientAction(agreement, {
      type: "reject",
      name: "Budi Santoso",
      reason: "Budget perusahaan dialihkan ke proyek lain.",
    });

    assert.strictEqual(rejectedAgr.status, "REJECTED", "Status harus REJECTED setelah klien menolak.");
    assert.strictEqual(isActiveStatus(rejectedAgr.status), false, "Status REJECTED harus membebaskan kuota (tidak aktif).");

    const rejectLog = rejectedAgr.activityLogs.find((l) => l.eventType === "REJECTED");
    assert.ok(rejectLog, "Harus tercatat log aktivitas dengan eventType 'REJECTED'.");
    assert.ok(rejectLog.description.includes("Budget perusahaan dialihkan"), "Alasan penolakan harus tercatat di log.");
    console.log("  ✓ 13.2 Klien berhasil menolak kesepakatan (REJECTED), alasan tercatat, dan kuota aktif dibebaskan.");
  }

  // Skenario 3: Penolakan Permintaan Perubahan (CHANGES_REQUESTED -> REJECTED REQUEST -> Reset Status)
  {
    const agreement = await buildNewAgreement({
      content: sampleContent,
      contractId: "SPK-2026-FLOW3",
      ownerId: "user-1",
      plan: "gratis",
      sendDirectly: true,
    });

    // Klien mengajukan permintaan revisi
    let agr = await applyClientAction(agreement, {
      type: "requestChange",
      name: "Budi Santoso",
      title: "Tambah fitur multi-bahasa",
      description: "Mohon ditambahkan bahasa Mandarin tanpa biaya tambahan.",
    });

    assert.strictEqual(agr.status, "CHANGES_REQUESTED");
    assert.strictEqual(agr.changeRequests.length, 1);
    const crId = agr.changeRequests[0].id;
    assert.strictEqual(agr.changeRequests[0].status, "OPEN");

    // Freelancer menolak permintaan revisi di luar lingkup
    agr = await applyOwnerAction(agr, {
      type: "rejectChangeRequest",
      requestId: crId,
      reason: "Permintaan di luar ruang lingkup yang disepakati.",
    });

    assert.strictEqual(agr.changeRequests[0].status, "REJECTED");
    assert.strictEqual(agr.status, "PENDING_CLIENT", "Status harus kembali ke PENDING_CLIENT karena tidak ada open request tersisa.");
    const changeRejectLog = agr.activityLogs.find((l) => l.eventType === "CHANGE_REJECTED");
    assert.ok(changeRejectLog, "Log penolakan revisi harus tercatat.");
    console.log("  ✓ 13.3 Freelancer berhasil menolak revisi di luar lingkup dan status kembali konsisten.");
  }

  // Skenario 4: Pembuatan Dokumen Addendum Terikat Kontrak Induk
  {
    const parentContractId = "SPK-2026-INDUK-001";
    const parentAgreementId = "agr-parent-123";

    const addendumContent: ContractContentJSON = {
      ...sampleContent,
      projectName: "Addendum 1: Integrasi Payment Gateway Tambahan",
      parentAgreementId,
      parentContractId,
      scope: {
        description: "Pekerjaan tambahan addendum untuk integrasi payment gateway.",
        deliverables: ["Modul QRIS Dinamis", "Webhook Handler"],
        exclusions: ["Biaya pendaftaran merchant gateway"],
      },
      payment: {
        totalValue: 3500000,
        currency: "IDR",
        dpPercent: 100,
        milestones: [{ title: "Pembayaran Penuh 100%", amount: 3500000 }],
        finalPaymentDueDays: 3,
      },
    };

    const addendumAgreement = await buildNewAgreement({
      content: addendumContent,
      contractId: "SPK-2026-ADDENDUM-01",
      ownerId: "user-1",
      plan: "pro",
      parentAgreementId,
      parentContractId,
    });

    assert.strictEqual(addendumAgreement.parentAgreementId, parentAgreementId);
    assert.strictEqual(addendumAgreement.parentContractId, parentContractId);
    assert.strictEqual(addendumAgreement.contractId, "SPK-2026-ADDENDUM-01");
    assert.notStrictEqual(addendumAgreement.contractId, parentContractId);

    // Verifikasi data publik
    const verificationData = await toVerificationData(addendumAgreement);
    assert.strictEqual(verificationData.parentContractId, parentContractId);
    assert.strictEqual(verificationData.contractId, "SPK-2026-ADDENDUM-01");

    console.log("  ✓ 13.4 Berhasil membuat Addendum terikat Kontrak Induk, nomor unik terpisah & data verifikasi valid.");
  }
}
