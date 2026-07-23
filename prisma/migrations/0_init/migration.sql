-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'NURSE', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MAN', 'WOMAN');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('ANXIETY', 'DEPRESSION', 'PHYSICAL', 'IMPACT', 'GENERAL');

-- CreateEnum
CREATE TYPE "QuestionInstrument" AS ENUM ('GAD7', 'PHQ9', 'SRQ20');

-- CreateEnum
CREATE TYPE "SymptomType" AS ENUM ('MAJOR', 'MINOR', 'CAUSE', 'IMPACT');

-- CreateEnum
CREATE TYPE "ScreeningStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'AI_ANALYZED', 'VALIDATED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NONE', 'MINIMAL', 'MILD', 'MODERATE', 'SEVERE', 'HIGH');

-- CreateEnum
CREATE TYPE "DiagnosisCategory" AS ENUM ('PSIKOLOGIS', 'FISIOLOGIS', 'KEBUTUHAN_DASAR', 'KEHAMILAN', 'KOMUNITAS');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('OBSERVATION', 'THERAPEUTIC', 'EDUCATION', 'COLLABORATION');

-- CreateEnum
CREATE TYPE "OutcomeExpectation" AS ENUM ('MENINGKAT', 'MENURUN', 'MEMBAIK', 'MEMBURUK');

-- CreateEnum
CREATE TYPE "ValidationDecision" AS ENUM ('APPROVED', 'REVISED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "fullName" TEXT NOT NULL,
    "nip" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "medicalHistory" TEXT,
    "familyContactName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "instrument" "QuestionInstrument" NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "symptomType" "SymptomType",
    "order" INTEGER NOT NULL,
    "scaleMin" INTEGER NOT NULL DEFAULT 0,
    "scaleMax" INTEGER NOT NULL DEFAULT 4,
    "scaleLabels" TEXT NOT NULL,
    "helpText" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screenings" (
    "id" TEXT NOT NULL,
    "status" "ScreeningStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "instrument" "QuestionInstrument",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "screenings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_answers" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "notes" TEXT,
    "screeningId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "screening_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "majorSymptoms" TEXT NOT NULL,
    "minorSymptoms" TEXT NOT NULL,
    "possibleCauses" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "recommendedDiagnoses" TEXT NOT NULL,
    "emergencyFlags" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screeningId" TEXT NOT NULL,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_validations" (
    "id" TEXT NOT NULL,
    "decision" "ValidationDecision" NOT NULL,
    "notes" TEXT,
    "revisedRiskLevel" "RiskLevel",
    "revisedCategory" TEXT,
    "revisedScore" INTEGER,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screeningId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,

    CONSTRAINT "nurse_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DiagnosisCategory" NOT NULL,
    "subcategory" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "causes" TEXT NOT NULL,
    "clinicalConditions" TEXT NOT NULL,
    "references" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "id" TEXT NOT NULL,
    "type" "SymptomType" NOT NULL,
    "subjective" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "diagnosisId" TEXT NOT NULL,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcomes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "expectation" "OutcomeExpectation" NOT NULL,
    "references" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,

    CONSTRAINT "outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcome_criteria" (
    "id" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "scaleType" TEXT NOT NULL,
    "score1" TEXT NOT NULL,
    "score2" TEXT NOT NULL,
    "score3" TEXT NOT NULL,
    "score4" TEXT NOT NULL,
    "score5" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "outcomeId" TEXT NOT NULL,

    CONSTRAINT "outcome_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "references" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intervention_actions" (
    "id" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "action" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "interventionId" TEXT NOT NULL,

    CONSTRAINT "intervention_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_diagnoses" (
    "id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "screeningId" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,

    CONSTRAINT "screening_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_outcomes" (
    "id" TEXT NOT NULL,
    "targetScore" INTEGER NOT NULL DEFAULT 5,
    "currentScore" INTEGER,
    "notes" TEXT,
    "screeningDiagnosisId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,

    CONSTRAINT "screening_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_interventions" (
    "id" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "screeningDiagnosisId" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,

    CONSTRAINT "screening_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simrs_sync" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "screeningId" TEXT,

    CONSTRAINT "simrs_sync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nik_key" ON "patients"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "patients_userId_key" ON "patients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "screening_answers_screeningId_questionId_key" ON "screening_answers"("screeningId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_analyses_screeningId_key" ON "ai_analyses"("screeningId");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_validations_screeningId_key" ON "nurse_validations"("screeningId");

-- CreateIndex
CREATE UNIQUE INDEX "diagnoses_code_key" ON "diagnoses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "outcomes_code_key" ON "outcomes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "interventions_code_key" ON "interventions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "screening_diagnoses_screeningId_diagnosisId_key" ON "screening_diagnoses"("screeningId", "diagnosisId");

-- CreateIndex
CREATE UNIQUE INDEX "screening_outcomes_screeningDiagnosisId_outcomeId_key" ON "screening_outcomes"("screeningDiagnosisId", "outcomeId");

-- CreateIndex
CREATE UNIQUE INDEX "screening_interventions_screeningDiagnosisId_interventionId_key" ON "screening_interventions"("screeningDiagnosisId", "interventionId");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenings" ADD CONSTRAINT "screenings_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_answers" ADD CONSTRAINT "screening_answers_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "screenings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_answers" ADD CONSTRAINT "screening_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "screenings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_validations" ADD CONSTRAINT "nurse_validations_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "screenings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_validations" ADD CONSTRAINT "nurse_validations_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_criteria" ADD CONSTRAINT "outcome_criteria_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention_actions" ADD CONSTRAINT "intervention_actions_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "interventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_diagnoses" ADD CONSTRAINT "screening_diagnoses_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "screenings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_diagnoses" ADD CONSTRAINT "screening_diagnoses_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "diagnoses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_outcomes" ADD CONSTRAINT "screening_outcomes_screeningDiagnosisId_fkey" FOREIGN KEY ("screeningDiagnosisId") REFERENCES "screening_diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_outcomes" ADD CONSTRAINT "screening_outcomes_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "outcomes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_interventions" ADD CONSTRAINT "screening_interventions_screeningDiagnosisId_fkey" FOREIGN KEY ("screeningDiagnosisId") REFERENCES "screening_diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_interventions" ADD CONSTRAINT "screening_interventions_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "interventions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simrs_sync" ADD CONSTRAINT "simrs_sync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simrs_sync" ADD CONSTRAINT "simrs_sync_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "screenings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

