// Sepakatin — TypeScript Core Type Definitions

export type AgreementStatus =
  | "DRAFT"
  | "PENDING_CLIENT"
  | "CHANGES_REQUESTED"
  | "PENDING_APPROVAL"
  | "AGREED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "REJECTED";

export type UserRole = "freelancer" | "client" | "admin";

/** Paket yang dipakai sebuah kesepakatan saat dibuat. */
export type PlanId = "gratis" | "per-proyek" | "pro";

export interface PartyInfo {
  name: string;
  email: string;
  role?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface ScopeTerms {
  description: string;
  deliverables: string[];
  exclusions: string[];
  acceptanceCriteria: string[];
}

export interface MilestoneItem {
  id?: string;
  title: string;
  amount: number;
  dueDate?: string;
}

export interface PaymentTerms {
  totalValue: number;
  currency: string; // e.g. 'IDR'
  paymentMethod: string; // e.g. 'Bank Transfer / VA'
  dpPercent: number; // e.g. 50
  milestones?: MilestoneItem[];
  finalPaymentDueDays: number; // e.g. 7 days after sign-off
}

export interface RevisionTerms {
  count: number; // e.g. 3
  terms: string; // e.g. 'Minor scope adjustments without altering fundamental wireframe'
  extraRevisionRate?: number; // e.g. 350000 per extra revision round
}

export interface TimelineTerms {
  startDate: string;
  deadline: string;
}

export interface IntellectualPropertyTerms {
  ownershipClause: string; // e.g. 'Hak Cipta dan kepemilikan aset final dialihkan sepenuhnya kepada Klien setelah pelunasan pembayaran 100%.'
  customTerms?: string;
}

export interface TerminationTerms {
  cancellationCondition: string;
  noticePeriodDays: number; // e.g. 7
  outstandingPaymentTerms: string;
}

export interface ContractContentJSON {
  contractId: string;
  projectName: string;
  freelancer: PartyInfo;
  client: PartyInfo;
  scope: ScopeTerms;
  payment: PaymentTerms;
  revision: RevisionTerms;
  timeline: TimelineTerms;
  ip: IntellectualPropertyTerms;
  termination: TerminationTerms;
  validFrom: string;
  validUntil: string;
  specialNotes?: string;
}

export interface AgreementApprovalRecord {
  id: string;
  agreementId: string;
  versionId: string;
  versionNumber: number;
  signerName: string;
  signerEmail: string;
  role: "freelancer" | "client";
  status: "APPROVED" | "PENDING" | "REJECTED";
  documentHash: string;
  approvedAt: string;
  /**
   * Jejak teknis saat persetujuan direkam, diisi server (tidak bisa dipalsukan browser).
   * Berguna sebagai bukti tambahan bila salah satu pihak menyangkal telah menyetujui.
   */
  ipAddress?: string;
  userAgent?: string;
}

export interface ChangeRequestRecord {
  id: string;
  agreementId: string;
  requestedBy: string;
  requesterEmail?: string;
  title: string;
  description: string;
  status: "OPEN" | "APPLIED" | "REJECTED";
  createdAt: string;
  resolvedAt?: string;
}

export interface AgreementVersionRecord {
  id: string;
  agreementId: string;
  versionNumber: number;
  contentJson: ContractContentJSON;
  documentHash: string;
  createdBy: string;
  createdAt: string;
}

export type AgreementVersion = AgreementVersionRecord;
export type ChangeRequest = ChangeRequestRecord;
export type AgreementApproval = AgreementApprovalRecord;

export interface ActivityLogItem {
  id: string;
  agreementId: string;
  actorName: string;
  eventType:
    | "CREATED"
    | "SENT_TO_CLIENT"
    | "VIEWED_BY_CLIENT"
    | "CHANGE_REQUESTED"
    | "VERSION_BUMPED"
    | "FREELANCER_APPROVED"
    | "CLIENT_APPROVED"
    | "AGREED_LOCKED"
    | "COMPLETED"
    | "CANCELLED";
  description: string;
  createdAt: string;
}

export type CopyType = "freelancer_copy" | "client_copy" | "both";

export interface EMateraiRecord {
  id: string;
  agreementId: string;
  versionNumber: number;
  imageUrl: string; // Base64 data url or file path of official e-meterai
  serialNumber?: string;
  targetCopy: CopyType; // "freelancer_copy" (on Client col), "client_copy" (on Freelancer col), or "both"
  uploadedAt: string;
  uploadedBy: string;
}

export interface StampedDocumentRecord {
  id: string;
  agreementId: string;
  copyType: "freelancer_copy" | "client_copy";
  fileName: string;
  fileUrl: string; // Base64 data URL (legacy) atau signed download URL saat di-fetch
  storagePath?: string; // Path penyimpanan objek di Supabase Storage (mis. "agreements/SPK-123/freelancer_copy.pdf")
  fileSize?: number; // Ukuran file dalam bytes
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
}

export interface SignatureRecord {
  id: string;
  agreementId?: string;
  signerRole: "freelancer" | "client";
  signerName: string;
  signatureDataUrl: string; // Base64 data url of signature stroke or cursive
  signedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export type VisualSignature = SignatureRecord;

export interface AgreementRecord {
  id: string;
  projectId: string;
  contractId: string; // e.g. SPK-2026-00124
  status: AgreementStatus;
  currentVersionNumber: number;
  reviewToken: string; // Unique URL token for client review
  reviewTokenExpiresAt?: string; // Masa berlaku tautan review klien (14 hari TTL)
  ownerId: string; // id akun freelancer pemilik
  plan: PlanId; // paket yang dipakai kesepakatan ini
  validFrom: string;
  validUntil: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Denormalized/populated fields for instant UI consumption
  versions: AgreementVersionRecord[];
  currentVersion: AgreementVersionRecord;
  approvals: AgreementApprovalRecord[];
  changeRequests: ChangeRequestRecord[];
  activityLogs: ActivityLogItem[];
  // Dokumen bermeterai resmi (hasil unggah ulang setelah bermeterai di portal eksternal)
  stampedDocuments?: StampedDocumentRecord[];
  // e-Materai & Visual Signature records (fallback / legacy)
  ematerai?: EMateraiRecord;
  emateraiList?: EMateraiRecord[];
  signatures?: SignatureRecord[];
}

export interface ProjectRecord {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  clientName: string;
  clientEmail: string;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
  totalValue: number;
  startDate: string;
  deadline: string;
  agreementId?: string;
  contractId?: string;
  agreementStatus?: AgreementStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicVerificationData {
  contractId: string;
  status: AgreementStatus;
  projectName: string;
  versionNumber: number;
  documentHash: string;
  isIntegrityMatched: boolean;
  partiesApprovedCount: number;
  totalPartiesRequired: number;
  freelancerApprovedAt?: string;
  clientApprovedAt?: string;
  validFrom: string;
  validUntil: string;
  freelancerName: string;
  clientName: string;
  hasStampedDocuments: boolean;
  stampedDocumentsCount: number;
  verifiedAt: string;
}

export interface AdminAuditLogItem {
  id: string;
  adminId: string;
  adminEmail: string;
  action: "UPDATE_PLAN" | "UPDATE_CREDITS" | "CANCEL_AGREEMENT" | "DELETE_AGREEMENT" | "DELETE_USER";
  targetType: "USER" | "AGREEMENT";
  targetId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type PaymentPackageType = "credit_1" | "pro_monthly";
export type PaymentOrderStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";

export interface PaymentOrderRecord {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  packageType: PaymentPackageType;
  amount: number;
  paymentMethod: string;
  paymentGateway: string;
  gatewayTransactionId?: string;
  paymentUrl?: string;
  status: PaymentOrderStatus;
  paidAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLogRecord {
  id: string;
  recipientEmail: string;
  notificationType: "VIEWED_BY_CLIENT" | "CHANGE_REQUESTED" | "AGREED_LOCKED" | "PAYMENT_SUCCESS";
  agreementId?: string;
  status: "SENT" | "FAILED" | "MOCKED";
  errorMessage?: string;
  sentAt: string;
}
