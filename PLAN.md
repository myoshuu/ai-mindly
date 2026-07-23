# AI-Mindly: Implementation Plan

## Context & Goals

AI-Mindly is a mental health nursing screening application for Indonesian healthcare. It follows the Indonesian nursing standards:
- **SDKI** (Standar Diagnosis Keperawatan Indonesia) — nursing diagnoses
- **SLKI** (Standar Luaran Keperawatan Indonesia) — patient outcomes
- **SIKI** (Standar Intervensi Keperawatan Indonesia) — nursing interventions

**Workflow**: Patient completes screening questionnaire → AI analyzes → Nurse validates → Diagnosis + Interventions assigned → Report generated.

**Documents analyzed**:
- `DIAGNOSA KEPERAWATAN.docx` — Nursing diagnosis standards (Gangguan Citra Tubuh, Gangguan Presepsi Sensori, Ansietas) with full SDKI/SLKI/SIKI data
- `PENJELASAN MENU APLIKASI.pdf` — 10-menu system specification with GAD-7 questionnaire, scoring, and clinical workflow details

---

## Tech Stack (Existing)

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.10 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-first config, oklch colors) |
| UI | Base UI + Shadcn components |
| Database | PostgreSQL via Prisma 7 |
| Auth | Better Auth (installed, NOT configured) |
| AI | Anthropic Claude SDK |
| Container | Docker + Docker Compose |

---

## Phase 1: Foundation & Database Schema

### 1.1 Expand Prisma Schema

The current schema has skeleton models but is missing critical fields. Replace with full schema:

**Enums to add:**
```prisma
enum DiagnosisCategory {
  PSIKOLOGIS
  FISIOLOGIS
  KEBUTUHAN_DASAR
  KEHAMILAN
  KOMUNITAS
}
```

**`User` model** — expand with profile fields:
- Add `fullName`, `nip`, `phone`, `isActive` fields
- Relations: `Patient[]`, `NurseValidation[]`

**`Patient` model** — current is good, keep:
- `nik`, `fullName`, `gender`, `birthDate`, `phone`, `address`, `emergencyContact`
- Add `dateOfBirth` (computed from birthDate), `age` (computed)
- Add `medicalHistory` (Json), `familyContactName`, `familyContactPhone`

**`Question` model** — replace entirely:
```prisma
model Question {
  id           Int    @id
  text         String
  category     QuestionCategory // ANXIETY, STRESS, PHYSICAL, IMPACT
  symptomType  SymptomType      // MAJOR, MINOR, CAUSE, IMPACT
  order        Int
  scaleMin     Int    @default(0)
  scaleMax     Int    @default(4)
  scaleLabels  Json   // e.g. ["Tidak Pernah","Jarang","Kadang-kadang","Sering","Hampir Selalu"]
}
```

**`ScreeningAnswer` model** — keep but add:
- `answer` (Int, the score 0-4), `notes` (optional)

**`AIAnalysis` model** — expand:
- Add `category` (anxiety level label), `recommendedDiagnoses` (Json array), `emergencyFlags` (Json)

**`Diagnosis` model (SDKI)** — replace entirely:
```prisma
model Diagnosis {
  id               String  @id @default(cuid())
  code             String  @unique  // e.g. "SDKI-001"
  title            String
  category         DiagnosisCategory
  subcategory      String  // e.g. "Integritas Ego"
  definition       String
  causes           String[]
  majorSymptoms    Symptom[]
  minorSymptoms    Symptom[]
  clinicalConditions String[]
  references       String[]
  priority         Int     @default(0)

  screeningDiagnoses ScreeningDiagnosis[]
  screeningDiagnosisPriorities ScreeningDiagnosisPriority[]
}

model Symptom {
  id          String  @id @default(cuid())
  diagnosisId String
  diagnosis   Diagnosis @relation(...)
  type        SymptomType  // MAJOR or MINOR
  subjective  String
  objective   String
  order       Int
}
```

**`Outcome` model (SLKI)** — replace entirely:
```prisma
model Outcome {
  id           String  @id @default(cuid())
  code         String  @unique  // e.g. "SLKI-001"
  title        String
  diagnosisId  String
  diagnosis    Diagnosis @relation(...)
  definition   String
  expectation  String  // "Membaik" or "Menurun"
  criteria     OutcomeCriterion[]
  references   String[]
}

model OutcomeCriterion {
  id           String  @id @default(cuid())
  outcomeId    String
  outcome      Outcome @relation(...)
  indicator    String
  scaleType    String  // "meningkat" or "membaik"
  score1       String  // e.g. "Meningkat" or "Memburuk"
  score2       String
  score3       String
  score4       String
  score5       String
  order        Int
}
```

**`Intervention` model (SIKI)** — replace entirely:
```prisma
model Intervention {
  id           String  @id @default(cuid())
  code         String  @unique  // e.g. "SIKI-001"
  title        String
  diagnosisId  String
  diagnosis    Diagnosis @relation(...)
  definition   String
  observations InterventionAction[]
  therapeutics InterventionAction[]
  educations   InterventionAction[]
  collaborations InterventionAction[]
  references   String[]
}

model InterventionAction {
  id             String       @id @default(cuid())
  interventionId String
  intervention   Intervention @relation(...)
  type           ActionType   // OBSERVATION, THERAPEUTIC, EDUCATION, COLLABORATION
  action         String
  order          Int
}

model ScreeningDiagnosis {
  id           String  @id @default(cuid())
  screeningId  String
  diagnosisId  String
  priority     Int
  notes        String?
  screening    Screening @relation(...)
  diagnosis    Diagnosis @relation(...)
  outcome      ScreeningOutcome[]
  interventions ScreeningIntervention[]
}

model ScreeningOutcome {
  id           String  @id @default(cuid())
  screeningDiagnosisId String
  outcomeId    String
  targetScore  Int     @default(5)
  currentScore Int?
  notes        String?
}

model ScreeningIntervention {
  id           String  @id @default(cuid())
  screeningDiagnosisId String
  interventionId String
  isCompleted  Boolean @default(false)
  completedAt  DateTime?
  notes        String?
}
```

**Add `Notification` model:**
```prisma
model Notification {
  id       String   @id @default(cuid())
  userId   String
  title    String
  message  String
  type     String   // "NEW_PATIENT", "VALIDATION_PENDING", "HIGH_RISK", etc.
  isRead   Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**Add SIMRS sync infrastructure (no integration yet):**
```prisma
model SIMRSSync {
  id           String   @id @default(cuid())
  entityType   String   // "PATIENT", "SCREENING", "DIAGNOSIS"
  entityId     String
  syncStatus   String   // "PENDING", "SYNCED", "FAILED"
  syncedAt     DateTime?
  errorMessage String?
  createdAt    DateTime @default(now())
}
```

### 1.2 Environment Variables (.env)

Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
BETTER_AUTH_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.3 Folder Structure (create)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx          # Sidebar + header layout
│   ├── page.tsx            # Dashboard
│   ├── patients/
│   │   ├── page.tsx        # Patient list
│   │   └── [id]/page.tsx   # Patient detail
│   ├── screening/
│   │   ├── page.tsx        # Screening list
│   │   └── [id]/page.tsx   # Screening form & results
│   ├── validation/
│   │   ├── page.tsx        # Validation queue
│   │   └── [id]/page.tsx   # Validation detail
│   ├── diagnosis/
│   │   ├── page.tsx        # Diagnosis list
│   │   └── [id]/page.tsx   # Diagnosis detail (SDKI)
│   ├── intervention/
│   │   ├── page.tsx        # Intervention list
│   │   └── [id]/page.tsx   # Intervention detail (SIKI)
│   ├── outcomes/
│   │   └── page.tsx        # SLKI outcomes
│   ├── reports/
│   │   ├── page.tsx        # Report dashboard
│   │   └── [id]/page.tsx   # Report detail
│   ├── education/
│   │   └── page.tsx        # Education materials
│   └── settings/
│       └── page.tsx        # Settings
├── api/
│   ├── auth/[...all]/route.ts
│   ├── patients/route.ts
│   ├── patients/[id]/route.ts
│   ├── screenings/route.ts
│   ├── screenings/[id]/route.ts
│   ├── screenings/[id]/analyze/route.ts
│   ├── screenings/[id]/validate/route.ts
│   ├── screenings/[id]/diagnosis/route.ts
│   ├── diagnoses/route.ts
│   ├── outcomes/route.ts
│   ├── interventions/route.ts
│   ├── reports/route.ts
│   └── education/route.ts
components/
├── ui/                     # Re-export shadcn/base-ui components
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── tabs.tsx
│   ├── avatar.tsx
│   ├── alert.tsx
│   ├── progress.tsx
│   ├── tooltip.tsx
│   └── sheet.tsx
├── dashboard/
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── stat-card.tsx
│   └── chart-placeholder.tsx
├── patients/
│   ├── patient-form.tsx
│   ├── patient-list.tsx
│   └── patient-card.tsx
├── screening/
│   ├── questionnaire-form.tsx
│   ├── questionnaire-question.tsx
│   ├── result-card.tsx
│   └── risk-indicator.tsx
├── validation/
│   ├── validation-queue.tsx
│   ├── validation-detail.tsx
│   └── ai-confidence-badge.tsx
├── diagnosis/
│   ├── diagnosis-list.tsx
│   ├── diagnosis-card.tsx
│   └── symptom-checklist.tsx
├── intervention/
│   ├── intervention-list.tsx
│   ├── action-checklist.tsx
│   └── intervention-timeline.tsx
├── outcomes/
│   ├── outcome-list.tsx
│   └── criteria-score-input.tsx
└── reports/
    ├── report-filters.tsx
    ├── report-table.tsx
    └── export-button.tsx
lib/
├── prisma.ts              # Prisma client singleton
├── auth.ts                # Better Auth config
├── anthropic.ts           # Claude AI client
├── utils.ts               # Existing utils
├── validations/
│   ├── patient.ts         # Zod schemas
│   ├── screening.ts
│   ├── diagnosis.ts
│   └── intervention.ts
└── constants/
    ├── roles.ts
    ├── navigation.ts
    └── risk-levels.ts
prisma/
├── schema.prisma
└── seed.ts               # Seed nursing standards data
```

---

## Phase 2: Authentication (Better Auth)

### 2.1 Configure Better Auth

**File: `lib/auth.ts`**
- Set up email/password authentication
- Configure session management
- Define role-based access (ADMIN, NURSE, PATIENT)

**File: `middleware.ts`**
- Protect dashboard routes (require auth)
- Role-based route protection:
  - `/dashboard/patients` — NURSE, ADMIN
  - `/dashboard/validation` — NURSE, ADMIN
  - `/dashboard/settings` — ADMIN only
  - `/screening/*` — PATIENT

**File: `app/(auth)/login/page.tsx`**
- Login form with NIP/username + password
- "Remember Me" checkbox
- Error handling
- Link to register

**File: `app/(auth)/register/page.tsx`**
- Registration for patients (or admin-created accounts)
- Fields: NIK, full name, email, password, phone, address

### 2.2 Login Page Design (from document)

```
┌─────────────────────────────────────────┐
│  Sistem Informasi Perawat               │
│  Deteksi Cepat. Asuhan Tepat.           │
│                                         │
│  NAMA PENGGUNA / NIP                    │
│  [________________________]              │
│                                         │
│  KATA SANDI                              │
│  [________________________]              │
│                                         │
│  [ ] Tetap masuk di perangkat ini        │
│                                         │
│  [       Masuk       ]                  │
│                                         │
│  Lupa Sandi?                            │
│  Kesulitan mengakses akun?              │
│  Hubungi Bantuan                         │
└─────────────────────────────────────────┘
```

---

## Phase 3: Dashboard Layout & Navigation

### 3.1 Sidebar Navigation

**File: `components/dashboard/sidebar.tsx`**
- Collapsible sidebar with icons + labels
- Menu items (from document):
  1. Dashboard (home icon)
  2. Data Pengguna (users icon)
  3. Hasil Skrining (clipboard icon)
  4. Validasi (check-circle icon)
  5. Diagnosis (medical-icon icon)
  6. Intervensi (activity icon)
  7. Luaran (target icon)
  8. Laporan (bar-chart icon)
  9. Edukasi (book icon)
  10. Pengaturan (settings icon)
- Logout at bottom
- Role-based visibility

### 3.2 Dashboard Layout

**File: `app/(dashboard)/layout.tsx`**
- Persistent sidebar + top header
- Header: app name "Mindly", user name, notifications bell, avatar
- Main content area

### 3.3 Dashboard Page

**File: `app/(dashboard)/page.tsx`**
- Stats cards: Total Pasien, Skrining Hari Ini, Risiko Tinggi, Menunggu Validasi
- Grafik tren skrining mingguan (bar/line chart)
- Notifikasi pasien baru (recent list)
- Shortcut buttons ke Validasi dan Diagnosis
- Aktivitas terbaru

---

## Phase 4: Patient Management

### 4.1 Patient List Page

**File: `app/(dashboard)/patients/page.tsx`**

Features:
- Table with columns: NIK, Nama, Umur, Jenis Kelamin, No. HP, Aksi
- Search by NIK or name
- Filter by gender, age range
- Pagination
- Buttons: Tambah Pasien, Import Excel, Export Excel
- Row actions: Lihat Detail, Edit, Riwayat Kunjungan

### 4.2 Patient Form

**File: `app/(dashboard)/patients/new/page.tsx` and `[id]/edit/page.tsx`**

Fields:
- NIK (required, unique)
- Nama Lengkap
- Jenis Kelamin (select: Laki-laki/Perempuan)
- Tanggal Lahir (date picker)
- Umur (auto-computed)
- Alamat
- No. HP
- Kontak Darurat (Nama, No. HP)
- Riwayat Penyakit (textarea, JSON storage)

### 4.3 Patient Detail Page

**File: `app/(dashboard)/patients/[id]/page.tsx`**

Sections:
- Patient info card (demographics)
- Tab: Riwayat Skrining (list of past screenings with dates, scores)
- Tab: Riwayat Diagnosis (list of past diagnoses)
- Tab: Riwayat Kunjungan

---

## Phase 5: Screening System

### 5.1 Screening List

**File: `app/(dashboard)/screening/page.tsx`**

- Table: Pasien, Tanggal, Instrumen (PHQ-9/GAD-7/SRQ-20), Skor Total, Tingkat Risiko, Status, Aksi
- Filter by: date range, risk level, status
- Color-coded risk badges: LOW (green), MODERATE (yellow), HIGH (red)
- Action: Lihat Hasil

### 5.2 Screening Form (Patient-facing)

**File: `app/(dashboard)/screening/new/[patientId]/page.tsx`**

- Select patient (or auto-fill if patient is logged in)
- Show 10 GAD-7 questions (from document):
  - 5-point Likert scale: 0=Tidak Pernah, 1=Jarang, 2=Kadang-kadang, 3=Sering, 4=Hampir Selalu
- Progress indicator
- Auto-save draft
- Submit button

### 5.3 Screening Result Page

**File: `app/(dashboard)/screening/[id]/page.tsx`**

Display:
- Patient info header
- Grafik perubahan skor (line chart over time if historical)
- Skor Total with risk level indicator
- Kategori Risiko badge
- Tanggal Skrining
- Tombol "Lihat Detail Jawaban"
- Tombol "Validasi" (for nurse role)
- Tombol "Ambil Diagnosis"

### 5.4 AI Analysis API

**File: `app/api/screenings/[id]/analyze/route.ts`**

1. Collect screening answers
2. Send to Anthropic Claude with prompt containing:
   - All answers and scores
   - SDKI diagnosis criteria
   - Ask for: risk level, recommended diagnoses, reasoning
3. Store AIAnalysis record
4. Update Screening status to AI_ANALYZED
5. Create Notification for nurses

---

## Phase 6: Nurse Validation

### 6.1 Validation Queue

**File: `app/(dashboard)/validation/page.tsx`**

- List of screenings awaiting validation
- Columns: Pasien, Tanggal, AI Risk Level, Confidence Score, Prediksi AI, Aksi
- Filter: all, pending, approved, rejected
- Priority sorting (high risk first)
- Badge: Confidence Score percentage

### 6.2 Validation Detail

**File: `app/(dashboard)/validation/[id]/page.tsx`**

Layout:
- Left: AI Prediction card
  - Prediksi AI (risk level with confidence %)
  - Reasoning AI (full text explanation)
  - Skor Total
- Right: Patient Answer Review
  - All questions with patient answers
  - Corrected scores (editable by nurse)
- Bottom: Action buttons
  - ✅ Setujui (approve)
  - ✏️ Revisi (edit results)
  - ❌ Tolak (reject)
  - Kolom Catatan (notes textarea)

---

## Phase 7: Diagnosis (SDKI)

### 7.1 Diagnosis List Page

**File: `app/(dashboard)/diagnosis/page.tsx`**

- Grid/list of all SDKI diagnoses from the document
- Filter by category: Psikologis, Fisiologis, etc.
- Search by code or title
- Categories from document:
  - **Gangguan Citra Tubuh** (Psikologis / Integritas Ego)
  - **Gangguan Presepsi Sensori** (Psikologis / Integritas Ego)
  - **Ansietas** (Psikologis / Integritas Ego)

### 7.2 Diagnosis Detail Page

**File: `app/(dashboard)/diagnosis/[id]/page.tsx`**

Display full SDKI data:
- Code + Title
- Kategori + Subkategori
- Definisi
- Penyebab (list)
- Gejala & Tanda Mayor
  - Subjektif + Objektif
- Gejala & Tanda Minor
  - Subjektif + Objektif
- Kondisi Klinis Terkait
- Referensi

### 7.3 Assign Diagnosis to Screening

**File: `app/(dashboard)/screening/[id]/diagnosis/page.tsx`**

- List of available diagnoses (from SDKI)
- Checkbox selection
- Priority ordering (drag or number input)
- Notes per diagnosis
- Luaran section:
  - Show related SLKI outcomes
  - Target score selection (1-5)
- Intervensi section:
  - Show related SIKI interventions
  - Select which interventions to include

---

## Phase 8: Interventions (SIKI)

### 8.1 Intervention Detail Page

**File: `app/(dashboard)/intervention/[id]/page.tsx`**

Display full SIKI data:
- Code + Title
- Definisi
- Tindakan Observasi (list)
- Tindakan Terapeutik (list)
- Tindakan Edukasi (list)
- Tindakan Kolaborasi (list)

### 8.2 Intervention Checklist (per patient)

**File: `app/(dashboard)/screening/[id]/intervention/[intId]/page.tsx`**

- Checklist of all actions grouped by type
- Each item: checkbox + action text
- When checked: record completion with timestamp + notes
- Overall progress bar
- Add additional notes
- Mark intervention as complete

---

## Phase 9: Luaran (SLKI)

### 9.1 Outcome List Page

**File: `app/(dashboard)/outcomes/page.tsx`**

- List of SLKI outcomes
- Filter by related diagnosis
- Show expectation type (Membaik/Menurun)
- Link to criteria scoring

### 9.2 Outcome Scoring Page

**File: `app/(dashboard)/screening/[id]/outcome/[outcomeId]/page.tsx`**

- Show all criteria with 1-5 scoring scale
- Current score vs target score
- Progress visualization
- Notes field

---

## Phase 10: Reports (Laporan)

### 10.1 Report Dashboard

**File: `app/(dashboard)/reports/page.tsx`**

- Filter: date range (default: last 30 days), nurse, room
- Stats: Total Pasien, Total Skrining, Distribusi Risiko
- Grafik:
  - Tren skrining mingguan (bar chart)
  - Distribusi risiko (pie chart)
  - Per diagnosis (bar chart)
- Table: Detail records

### 10.2 Report Actions

- Export PDF button
- Export Excel button
- Print button

---

## Phase 11: Education (Edukasi)

### 11.1 Education Page

**File: `app/(dashboard)/education/page.tsx`**

Sections (topic: Psikotik Akut & Gangguan Mental Emosional):
- Video Edukasi:
  - https://youtu.be/V4Q8BSMw7E0
  - https://youtu.be/Y2magkvJbt4
  - https://youtu.be/ooyHobBSO5w
- Article cards
- Teknik Relaksasi
- Latihan Pernapasan
- Self-care tips
- FAQ

### 11.2 Education for Patient

- Link education materials to patient screening record
- Track which education was provided

---

## Phase 12: Settings (Pengaturan)

### 12.1 Settings Page

**File: `app/(dashboard)/settings/page.tsx`**

Sections:
- Manajemen Akun (list users, add/edit)
- Hak Akses: Admin, Perawat, Pasien
- Ubah Password
- Tema Aplikasi (light/dark toggle)
- Konfigurasi AI (API key, model settings)
- Backup Data (export DB)
- Sinkronisasi SIMRS (placeholder)
- Pengaturan Notifikasi

---

## Phase 13: Seed Data

### 13.1 Seed Nursing Standards

**File: `prisma/seed.ts`**

Seed all SDKI diagnoses from the document:
1. **Gangguan Citra Tubuh** (SDKI)
2. **Gangguan Presepsi Sensori** (SDKI)
3. **Ansietas** (SDKI)

For each diagnosis, include:
- SDKI: code, title, category, subcategory, definition, causes, symptoms (major/minor), clinical conditions, references
- SLKI: outcome with criteria (1-5 scale scoring)
- SIKI: intervention with all action types (Observation, Therapeutic, Education, Collaboration)

Seed default users:
- Admin account
- Nurse account(s)
- Test patient account

### 13.2 Seed Questionnaire

Seed all three screening instruments:

**GAD-7** (Generalized Anxiety Disorder) — 7 questions:
- Anxiety symptoms screening
- 0-4 Likert scale
- Total score: 0-21
- Risk levels: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-21 (severe)

**PHQ-9** (Patient Health Questionnaire) — 9 questions:
- Depression screening
- 0-3 Likert scale (0=Not at all, 1=Several days, 2=More than half, 3=Nearly every day)
- Total score: 0-27
- Risk levels: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-19 (moderately severe), 20-27 (severe)

**SRQ-20** (Self Reporting Questionnaire) — 20 questions:
- General mental health screening
- Yes/No scoring (0 or 1)
- Total score: 0-20
- Risk levels: cut-off varies, typically ≥8 indicates mental disorder

---

## Phase 14: Polish & Integration

### 14.1 Mobile Responsiveness

- Sidebar collapses to hamburger menu on mobile
- Tables become cards on mobile
- Screening form optimized for mobile

### 14.2 Notifications System

- Real-time notification badge
- Notification page
- Toast notifications for actions

### 14.3 Search & Filters

- Global search across patients, diagnoses, interventions
- Persistent filter state in URL params

### 14.4 Loading States & Skeletons

- Add loading skeletons for all pages
- Optimize with Suspense boundaries

### 14.5 Error Handling

- Global error boundary
- Form validation with Zod + React Hook Form
- Toast notifications for errors

---

## Implementation Order

1. **Prisma schema** — Expand all models
2. **Auth** — Better Auth setup + login/register pages
3. **Layout** — Sidebar + dashboard layout
4. **Patients** — List + form + detail
5. **Screening** — Form + results + list
6. **AI Analysis** — API integration
7. **Validation** — Queue + detail page
8. **Diagnosis** — List + detail + assign to screening
9. **Outcomes (SLKI)** — List + detail + scoring
10. **Interventions (SIKI)** — List + detail + checklist
11. **Dashboard** — Stats + charts + notifications
12. **Reports** — Filter + export
13. **Education** — Video + articles
14. **Settings** — User management + config
15. **Seed data** — SDKI/SLKI/SIKI + test users
16. **Polish** — Mobile, loading states, error handling

---

## Decisions (User Confirmed)

- **Seed scope**: 3 diagnoses from documents only (Gangguan Citra Tubuh, Gangguan Presepsi Sensori, Ansietas). Schema designed to support full PPNI (~200+) without changes.
- **Instruments**: All three — PHQ-9 (depression), GAD-7 (anxiety), SRQ-20 (general mental health)
- **Export**: PDF + Excel
- **SIMRS**: API/schema infrastructure ready, integration not implemented

## Questions for User

*(Answered above — scope confirmed as: 3 diagnoses, 3 instruments, PDF+Excel, SIMRS-ready)*
