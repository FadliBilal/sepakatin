// ==============================================================================
// Sepakatin — TypeScript Core Type Definitions
// ==============================================================================

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

export type CopyType = "freelancer_copy" | "client_copy";

export interface EMateraiRecord {
  id: string;
  agreementId: string;
  versionNumber: number;
  imageUrl: string; // Base64 data url or file path of official e-meterai
  serialNumber?: string;
  targetCopy: CopyType; // "freelancer_copy" (on Client col) or "client_copy" (on Freelancer col)
  uploadedAt: string;
  uploadedBy: string;
}

export interface SignatureRecord {
  id: string;
  agreementId?: string;
  signerRole: "freelancer" | "client";
  signerName: string;
  signatureDataUrl: string; // Base64 data url of signature stroke or cursive
  signedAt: string;
}

export interface AgreementRecord {
  id: string;
  projectId: string;
  contractId: string; // e.g. SPK-2026-00124
  status: AgreementStatus;
  currentVersionNumber: number;
  reviewToken: string; // Unique URL token for client review
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
  // e-Materai & Visual Signature records
  ematerai?: EMateraiRecord;
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
  verifiedAt: string;
}
