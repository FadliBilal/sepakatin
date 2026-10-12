# PRD — Sepakatin

**Product:** Sepakatin  
**Version:** 1.0  
**Status:** MVP / Pre-Validation  
**Target Market:** Freelancer digital Indonesia dan client/pemberi kerja  
**Primary Customer:** Freelancer digital  
**Technology:** Next.js + Supabase  
**Business Model:** Freemium + Pay-per-Project + Pro Subscription

---

# 1. Executive Summary

## 1.1 Gambaran Produk

Sepakatin adalah platform untuk membantu freelancer dan client mengubah kesepakatan proyek yang biasanya tersebar di WhatsApp, email, atau dokumen menjadi satu **agreement terstruktur** yang dapat:

1. dibuat,
2. dikirim,
3. ditinjau,
4. disetujui kedua pihak,
5. dikunci berdasarkan versi yang disetujui,
6. digunakan sebagai acuan project,
7. memiliki riwayat perubahan,
8. menghasilkan dokumen PDF, dan
9. diverifikasi melalui Contract ID.

Sepakatin **bukan** platform pengganti lawyer, bukan pemberi nasihat hukum, dan bukan jaminan bahwa isi kontrak sah secara hukum.

Fokus MVP adalah membangun **single source of truth untuk kesepakatan proyek**.

## 1.2 Masalah

Dalam pekerjaan freelance, kesepakatan sering terjadi melalui chat:

- scope pekerjaan dibahas di beberapa percakapan,
- harga dan deadline dapat berubah,
- jumlah revisi tidak selalu tercatat dengan jelas,
- perubahan pekerjaan dapat terjadi setelah project berjalan,
- kedua pihak dapat memiliki versi informasi yang berbeda,
- bukti persetujuan sulit dicari ketika terjadi masalah.

**Problem utama:**

> Freelancer dan client kesulitan melacak dan membuktikan scope, deadline, harga, milestone, dan perubahan proyek setelah deal.

## 1.3 Solusi

Sepakatin menyediakan alur:

**Create Agreement → Review → Request Change → Approve → Lock Version → Project Record → Track Changes → Generate Document → Verify**

---

# 2. Product Vision

> Menjadi lapisan kepercayaan digital untuk kesepakatan kerja freelance, sehingga kedua pihak selalu memiliki satu acuan yang jelas mengenai apa yang telah disepakati.

## 2.1 Product Mission

Membuat proses kesepakatan proyek:

- mudah dibuat,
- mudah dipahami,
- mudah disetujui,
- mudah dilacak,
- mudah dibuktikan.

## 2.2 Positioning

> **“Jangan cuma deal di chat. Simpan kesepakatannya.”**

Alternative:

> **“Satu tempat untuk membuat, menyepakati, dan membuktikan kesepakatan kerja.”**

---

# 3. Target Market

## 3.1 Primary Target

Freelancer digital Indonesia:

- Web Developer
- Mobile Developer
- UI/UX Designer
- Graphic Designer
- Photographer
- Videographer
- Video Editor
- Social Media Specialist
- Copywriter
- Digital Marketing Specialist
- Small creative/digital agency

Karakteristik:

- menerima project berdasarkan kesepakatan langsung dengan client,
- sering menggunakan WhatsApp/email untuk komunikasi,
- project memiliki scope, harga, deadline, dan revisi,
- membutuhkan bukti kesepakatan tetapi belum tentu membutuhkan legal service penuh.

## 3.2 Secondary Target

Client/pemberi kerja:

- UMKM
- startup
- perusahaan kecil-menengah
- personal brand
- agency
- individu yang menyewa freelancer

Client bukan customer utama pada MVP. Client diposisikan sebagai **invited participant** agar adoption tidak terhambat.

## 3.3 Platform Stakeholder

Admin Sepakatin:

- mengelola platform,
- menangani laporan,
- memonitor abuse,
- mengelola template,
- mengelola user dan sistem.

---

# 4. Stakeholder & Role

## 4.1 Freelancer

Tujuan:

> Membuat dan mengelola kesepakatan project dengan client.

Hak:

- membuat agreement,
- mengubah draft,
- mengundang client,
- melihat status,
- mengajukan perubahan,
- melihat approval,
- melihat project,
- membuat dokumen,
- melihat riwayat.

## 4.2 Client

Tujuan:

> Memastikan kesepakatan sesuai sebelum menyetujui project.

Hak:

- melihat agreement,
- request change,
- memberikan persetujuan,
- melihat versi final,
- melihat project record,
- melihat perubahan.

## 4.3 Admin

Tujuan:

> Menjaga operasional dan keamanan platform.

Hak:

- user management,
- contract moderation,
- report handling,
- template management,
- system monitoring.

Admin tidak boleh mengubah isi agreement yang telah disetujui.

---

# 5. Core Business Problem

## Problem Statement

> Ketika freelancer dan client mencapai kesepakatan, informasi penting sering tersebar di berbagai chat dan dokumen. Ketika terjadi perubahan atau perselisihan, kedua pihak membutuhkan satu sumber kesepakatan yang jelas mengenai scope, harga, deadline, dan ketentuan project.

## Existing Alternatives

Saat ini user dapat menggunakan:

- WhatsApp
- Email
- Google Docs
- Microsoft Word
- PDF
- spreadsheet
- contract template
- jasa legal

Sepakatin tidak harus menggantikan seluruh tools tersebut.

Sepakatin fokus pada **agreement lifecycle**.

---

# 6. Value Proposition

## Untuk Freelancer

- tidak perlu mencari kembali chat lama,
- scope project lebih terstruktur,
- persetujuan client tercatat,
- perubahan memiliki riwayat,
- dokumen dapat dibuat dari data agreement,
- project memiliki satu sumber informasi.

## Untuk Client

- mengetahui dengan jelas apa yang dibeli,
- mengetahui harga dan deadline,
- dapat melakukan review sebelum approve,
- memiliki salinan agreement,
- dapat melihat perubahan.

## Untuk Sepakatin

- menciptakan workflow yang repeatable,
- memperoleh data agreement lifecycle,
- dapat membangun fitur project management secara bertahap,
- dapat memonetisasi freelancer tanpa mewajibkan client membayar.

---

# 7. Core Product Flow

```text
Freelancer
    |
    v
Create Project
    |
    v
Create Agreement
    |
    v
Draft
    |
    v
Send to Client
    |
    v
Client Review
    |
    +---- Request Change ----> Freelancer Edit
    |                              |
    |                              v
    |                         New Version
    |                              |
    +------------------------------+
    |
    v
Both Parties Approve
    |
    v
Agreement Locked
    |
    v
Project Active
    |
    +--> Milestones
    |
    +--> Changes
    |
    +--> Activity History
    |
    v
Project Completed
    |
    v
Final Agreement / Project Record
    |
    v
Verification
```

---

# 8. Agreement Lifecycle

Status utama:

```text
DRAFT
  ↓
PENDING_CLIENT
  ↓
CHANGES_REQUESTED
  ↓
PENDING_APPROVAL
  ↓
AGREED
  ↓
ACTIVE
  ↓
COMPLETED
```

Status alternatif:

```text
CANCELLED
EXPIRED
REJECTED
```

### 8.1 DRAFT
Agreement sedang dibuat oleh freelancer.  
Boleh:
- edit,
- delete,
- preview,
- save.  
Belum dapat diverifikasi sebagai agreement.

### 8.2 PENDING_CLIENT
Agreement telah dikirim ke client.  
Client dapat:
- view,
- request change,
- approve.  
Freelancer dapat melihat status.

### 8.3 CHANGES_REQUESTED
Client meminta perubahan.  
Agreement kembali menjadi draft/version baru.  
Versi sebelumnya tetap tersimpan sebagai history.

### 8.4 AGREED
Kedua pihak telah menyetujui versi yang sama.  
Sistem menyimpan:
- approval timestamp,
- user identity,
- document version,
- contract ID,
- content hash.  
Agreement tidak boleh diedit langsung.  
Perubahan setelah status AGREED harus membuat new version/amendment.

### 8.5 ACTIVE
Project sedang berjalan berdasarkan agreement.

### 8.6 COMPLETED
Project selesai.  
Project record tetap dapat diverifikasi.

### 8.7 CANCELLED
Project dibatalkan berdasarkan proses yang dicatat.

### 8.8 EXPIRED
Masa berlaku agreement berakhir.

---

# 9. Agreement Data Structure

### 9.1 General
- Contract ID
- Project Name
- Description
- Created Date
- Valid From
- Valid Until
- Status
- Version

### 9.2 Parties
**Freelancer:**
- Name
- Email
- Account ID

**Client:**
- Name
- Email
- Account ID atau invitation identity

### 9.3 Scope
- Project description
- Deliverables
- Exclusions
- Acceptance criteria

### 9.4 Payment
- Total project value
- Currency
- Payment method
- DP
- Milestone payment
- Final payment
- Due date

### 9.5 Revision
- Number of revisions
- Scope of revision
- Additional revision terms

### 9.6 Timeline
- Start date
- Deadline
- Milestone dates

### 9.7 Termination
- Cancellation condition
- Notice period
- Outstanding payment handling

### 9.8 Intellectual Property
MVP menyediakan pilihan/field sederhana untuk:
- ownership after full payment,
- ownership after delivery,
- client ownership,
- custom terms.  
Untuk MVP, jangan membuat klaim bahwa pilihan tersebut otomatis menghasilkan posisi hukum tertentu.

---

# 10. Project Lifecycle

Setelah agreement disetujui, sistem membuat/menjalankan Project.

### Project Dashboard
Menampilkan:
- Project name
- Client
- Freelancer
- Total value
- Start date
- Deadline
- Agreement status
- Milestone
- Deliverables
- Activity timeline
- Change history

Contoh tampilan:
```text
Website Company Profile

Value: Rp8.000.000
Deadline: 30 October 2026
Agreement: AGREED
Progress: 2 / 4 Milestones

Deliverables:
✓ UI Design
✓ Frontend
○ Backend
○ Deployment
```

---

# 11. Change Management

Perubahan harus menjadi bagian penting produk.

### Contoh Alur
Agreement awal:
- Website + 3 halaman + 3 kali revisi + Rp8 juta.

Client meminta:
- Tambah 2 halaman.

Freelancer membuat Change Request:
- change title,
- description,
- old scope,
- new scope,
- additional price,
- new deadline,
- requester,
- timestamp.

Client approve.  
Maka:
```text
Version 1: Rp8.000.000
        ↓ Change Request
Version 2: Rp9.500.000
```
Versi lama tidak dihapus untuk menjaga riwayat perubahan.

---

# 12. Approval System

MVP menggunakan digital approval, bukan tanda tangan elektronik tersertifikasi.

Approval record:
- `agreement_id`
- `version_id`
- `user_id`
- `role`
- `approved_at`
- `approval_status`
- `document_hash`

Contoh:
```text
Freelancer: Approved (20 Sep 2026 10:12)
Client: Approved (20 Sep 2026 10:14)
Version: v3
Hash: 8f4a9c2d...
```

### Terminologi Produk
Gunakan:
- Persetujuan Digital
- Agreement
- Approval
- Verified Agreement
- Document Verification

Hindari klaim:
- “Pasti sah secara hukum”
- “Dijamin legal”
- “Kontrak anti-sengketa”
- “Pengganti lawyer”
- “Tanda tangan elektronik tersertifikasi” jika belum menggunakan penyelenggara yang sesuai.

---

# 13. Document Generation

Setelah agreement disetujui, user dapat generate PDF.  
PDF minimal berisi:
- Contract ID
- Project information
- Parties
- Scope
- Payment
- Timeline
- Revision
- Termination
- Other terms
- Approval information
- Version
- Verification information

Footer:
```text
Generated by Sepakatin | Contract ID: SPK-2026-00124 | Version: v3
```

---

# 14. Verification System

Setiap agreement memiliki public verification endpoint.  
Contoh: `/verify/SPK-2026-00124`

Halaman menampilkan:
```text
AGREEMENT VERIFIED

Contract ID: SPK-2026-00124
Status: AGREED
Version: v3
Parties Approved: 2 / 2
Agreement Date: 20 September 2026
Valid Until: 30 October 2026
Document Integrity: MATCHED
```

### Hash Verification
Sistem membuat canonical representation dari agreement:
```text
Agreement Data → Canonical JSON → SHA-256 → Document Hash
```
Jika dokumen berubah:
```text
Current Hash ≠ Recorded Hash → Document mismatch / version differs.
```
*Catatan: Hash hanya digunakan untuk integrity verification, bukan sebagai klaim bahwa isi kontrak otomatis sah secara hukum.*

---

# 15. MVP Feature Scope

### MUST HAVE
1. **Authentication**
   - Sign up, Login, Logout
2. **Role**
   - Freelancer: Dashboard, Create project, Create agreement, Save draft, Preview, Send invitation, View approval status
   - Client: Invitation link, Agreement preview, Request change, Approve
3. **Agreement**
   - Contract ID, Version, Status, Scope, Price, Deadline, Revision, Validity, Parties
4. **Verification**
   - Agreement status, Approval status, Version, Timestamp, Hash, Public verification page
5. **Document**
   - Generate PDF

---

# 16. NICE TO HAVE (Post-MVP)
- Custom templates & more contract templates
- Milestone tracking & Payment tracking
- Invoice generation
- Email & WhatsApp notification
- Contract comparison
- Advanced audit trail
- Client management & Freelancer portfolio
- Project analytics & Custom branding
- Export data

---

# 17. OUT OF SCOPE MVP
Jangan dibangun pada MVP pertama:
- AI contract review
- OCR
- Lawyer marketplace
- Escrow & Payment gateway
- Blockchain
- Mobile application
- Certified electronic signature
- Dispute mediation
- Legal advice chatbot
- Full accounting system & Full project management suite

---

# 18. Technical Architecture

### Frontend: Next.js
- App Router
- Server Components jika sesuai
- Client Components untuk interactive approval
- Form validation
- PDF preview/download

### Backend: Supabase
- PostgreSQL
- Auth
- Storage
- Row Level Security (RLS)

```text
Next.js
   |
   +--- Authentication
   |
   +--- Dashboard
   |
   +--- Agreement UI
   |
   +--- Approval UI
   |
   +--- Verification UI
   |
   v
Supabase
   |
   +--- Auth
   +--- PostgreSQL
   +--- Storage
   +--- RLS
```

---

# 19. Database Design

- `profiles` (id, full_name, email, role, created_at, updated_at)
- `projects` (id, owner_id, name, description, status, start_date, deadline, total_value, created_at, updated_at)
- `project_parties` (id, project_id, user_id, party_type, email, name, approval_status, approved_at)
- `agreements` (id, project_id, contract_id, status, current_version_id, valid_from, valid_until, created_by, created_at, updated_at)
- `agreement_versions` (id, agreement_id, version_number, content_json, document_hash, created_by, created_at)
- `agreement_approvals` (id, agreement_id, version_id, user_id, role, status, approved_at)
- `change_requests` (id, agreement_id, requested_by, title, description, status, created_at, resolved_at)
- `milestones` (id, project_id, name, description, amount, due_date, status, created_at, updated_at)
- `activity_logs` (id, project_id, agreement_id, actor_id, event_type, metadata, created_at)
- `verification_records` (id, agreement_id, version_id, contract_id, document_hash, verified_at)

---

# 20. Security & Access Control

Akses dibatasi sesuai prinsip:
- **Freelancer**: Boleh membaca project miliknya, agreement miliknya, approval miliknya, client yang terhubung.
- **Client**: Boleh membaca agreement yang diberikan kepadanya, project yang diikuti, versi yang tersedia untuknya.
- **Public**: Hanya verification information yang boleh dibuka (jangan tampilkan data sensitif/email pribadi/isi penuh tanpa otorisasi).
- **Supabase RLS**: Wajib aktif untuk setiap tabel user/project.

---

# 21. Business Model & Pricing

- **Primary Customer**: Freelancer
- **Client Access**: Gratis sebagai invited participant

### Pricing Tiers
- **FREE — Rp0**: Maksimal 2 active agreements, basic template, approval, Contract ID, basic verification, PDF basic.
- **PROJECT — Rp19.000 / agreement**: Agreement lengkap, versioning, approval history, change request, project record, PDF, verification, milestone.
- **PRO — Rp49.000 / bulan**: Unlimited active projects, unlimited agreements, custom templates, client management, advanced history, dashboard, export, branding.

---

# 22. Pricing Objections & Risk Reversal
- **Free**: Free forever untuk 2 active agreements tanpa kartu.
- **Project (Rp19.000)**: 1 agreement gratis sebagai trial.
- **Pro (Rp49.000/bln)**: 14-day Pro trial tanpa kartu, cancel/pause kapan saja.

---

# 23. Unit Economics Hypothesis
Project Rp8.000.000 dengan biaya agreement Rp19.000 = 0.2375% dari total nilai proyek. Nilai ada pada struktur, approval, versioning, project record, dan verification.

---

# 24. Competitive Advantage
**Indonesian Freelancer Agreement Playbook**: Knowledge layer mengenai pola kesepakatan freelancer Indonesia (jenis project, scope, milestone, revisi, perubahan). Akumulasi data workflow kesepakatan.

---

# 25. Key Metrics
- **North Star**: Jumlah agreement yang disepakati kedua pihak (`Both Approved`).
- **Activation**: Sign up → Create Agreement → Send to Client.
- **Conversion**: Agreement Created → Client Viewed → Both Approved.
- **Retention**: Repeat agreement rate pada project berikutnya.

---

# 26. MVP Success Criteria
- Validasi 15 freelancer dengan pain point real.
- Target signal: Freelancer bersedia membuat agreement, client bersedia me-review & approve secara digital, user bersedia menggunakan kembali dan membayar.

---

# 27. Iteration Model
- **Iteration 0**: Problem Validation (15 Freelancer Interviews)
- **Iteration 1**: Basic Agreement MVP (Auth, Project, Agreement, Client Invitation, Approval, PDF)
- **Iteration 2**: Early Adopter Testing (5–10 Freelancers)
- **Iteration 3**: Change Management (Versioning, Change Request)
- **Iteration 4**: Verification (Contract ID, Canonical Hash, Public Verify Page)
- **Iteration 5**: Monetization

---

# 28. Operational Business Flow
Acquisition → Registration → Create Project → Create Agreement → Client Invitation → Review → Negotiation (Request Change / Versioning) → Approval → Agreement Active → Project Tracking → Completion → Final Record → Verification.

---

# 29. Revenue Operational Flow
Freelancer membuat agreement:
- Kuota Free tersedia → Free
- Kuota habis → Project Payment (Rp19.000)
- Active freelancer → Pro Subscription (Rp49.000/bln)  
*Client selalu gratis.*

---

# 30. Business Risks & Mitigation
1. **User merasa Word/WA cukup** → Fokus pada legal clarity, audit trail, versioning, and verification.
2. **Client friction** → Link instan, client tidak wajib register akun rumit saat review/approve pertama kali.
3. **Anggapan legal service** → Disclaimer tegas (agreement management platform, bukan pengganti advokat).
4. **Trust** → Canonical SHA-256 integrity hash, public verification, timestamped approvals.
5. **Scope creep** → Fokus ketat pada core flow MVP.

---

# 31. Product Roadmap Summary
- **Phase 1 (MVP)**: Auth, Project, Agreement, Client invitation, Approval, Versioning, PDF, Public Verification.
- **Phase 2**: Milestones, Change requests, Timeline, Payment tracking.
- **Phase 3**: Client & Template management, Analytics, Invoicing.
- **Phase 4**: Certified e-signature integration, Advanced audit trail.
- **Phase 5**: Freelancer reputation network & verified work history.

---

# 32. Example End-to-End Scenario
1. Freelancer (Fadli) membuat project: Website Company Profile (Rp8.000.000, 3 revisi, deadline 30 Okt 2026).
2. Sistem generate: `SPK-2026-00124 v1`.
3. Client (PT ABC) terima link, request perubahan (tambah halaman About Us).
4. Freelancer update agreement → Sistem terbitkan `v2`.
5. Kedua belah pihak klik digital approve untuk `v2`.
6. Status berubah: `AGREED`, hash tersimpan, PDF di-generate.
7. Bila ada perubahan scope nanti, dibuat Change Request resmi (`v3`).
8. Publik/pihak berkepentingan dapat cek keaslian dokumen via `/verify/SPK-2026-00124`.

---

# 33. Acceptance Criteria MVP
- **Create Agreement**: Freelancer login, buat project, isi detail kesepakatan, simpan draft.
- **Client Review**: Client buka invitation link tanpa hambatan, baca draft.
- **Request Change**: Client ajukan poin perubahan → status `CHANGES_REQUESTED`.
- **Approval**: Kedua pihak approve versi yang sama → status `AGREED`.
- **Versioning**: Dokumen `AGREED` terkunci secara immutable. Perubahan memicu versi baru.
- **PDF**: Menghasilkan PDF rapi dengan footer Contract ID, versi, dan verification hash.
- **Verification**: Halaman publik `/verify/[contract_id]` menampilkan status dan integritas SHA-256 hash.

---

# 34. Definition of Done — MVP
- [ ] Freelancer dapat register/login.
- [ ] Freelancer dapat membuat project.
- [ ] Freelancer dapat membuat agreement.
- [ ] Agreement dapat disimpan sebagai draft.
- [ ] Freelancer dapat mengirim invitation.
- [ ] Client dapat membuka agreement.
- [ ] Client dapat request change.
- [ ] Freelancer dapat membuat version baru.
- [ ] Kedua pihak dapat approve.
- [ ] Agreement menjadi immutable setelah approve.
- [ ] Approval history tersimpan.
- [ ] PDF dapat dibuat.
- [ ] Contract ID tersedia.
- [ ] Verification page tersedia.
- [ ] User hanya dapat mengakses data yang memang menjadi haknya.
- [ ] RLS Supabase aktif.
- [ ] Flow dapat digunakan dari awal sampai akhir tanpa intervensi developer.

---

# 35. Core Product Principle & Definition
> **"Apa yang sebenarnya sudah disepakati oleh kedua pihak?"**

Sepakatin bukan sekadar generator kontrak dan bukan pengganti lawyer. Sepakatin adalah **platform agreement management** untuk freelancer dan client yang mengubah kesepakatan proyek menjadi satu record terstruktur, disetujui kedua pihak, memiliki version history, dan dapat diverifikasi secara publik.

**Core Loop:** `CREATE → AGREE → RECORD → TRACK → VERIFY`
