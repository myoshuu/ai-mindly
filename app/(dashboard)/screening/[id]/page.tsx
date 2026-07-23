import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Target,
  Stethoscope,
  User,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { AnalyzeButton } from "./analyze-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const ScreeningDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const screening = await prisma.screening.findUnique({
    where: { id },
    include: {
      patient: {
        select: { id: true, fullName: true, nik: true, birthDate: true, gender: true },
      },
      answers: {
        include: {
          question: true,
        },
        orderBy: { question: { order: "asc" } },
      },
      ai: true,
      validation: {
        include: {
          nurse: { select: { fullName: true, role: true } },
        },
      },
      diagnoses: {
        include: {
          diagnosis: {
            select: { id: true, code: true, title: true, category: true },
          },
          outcomes: {
            include: { outcome: { select: { code: true, title: true } } },
          },
          interventions: {
            include: { intervention: { select: { code: true, title: true } } },
          },
        },
      },
    },
  });

  if (!screening) {
    notFound();
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const parseJson = (str: string): string[] => {
    try { return JSON.parse(str); } catch { return []; }
  };

  const getRiskBadge = (riskLevel?: string | null) => {
    switch (riskLevel) {
      case "HIGH": case "SEVERE":
        return { text: "Risiko Tinggi", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" };
      case "MODERATE":
        return { text: "Risiko Sedang", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" };
      case "MILD":
        return { text: "Risiko Ringan", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" };
      case "MINIMAL": case "NONE":
        return { text: "Minimal", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" };
      default:
        return { text: "Tidak Diketahui", class: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600" };
    }
  };

  const getStatusBadge = () => {
    if (screening.validation) {
      const map: Record<string, { text: string; class: string }> = {
        APPROVED: { text: "Disetujui Perawat", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
        REVISED: { text: "Direvisi", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
        REJECTED: { text: "Ditolak", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
      };
      return map[screening.validation.decision] || map.APPROVED;
    }
    const statusMap: Record<string, { text: string; class: string }> = {
      DRAFT: { text: "Draft", class: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
      SUBMITTED: { text: "Menunggu Analisis AI", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      AI_ANALYZED: { text: "Menunggu Validasi", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
      VALIDATED: { text: "Tervalidasi", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      COMPLETED: { text: "Selesai", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    };
    return statusMap[screening.status] || statusMap.DRAFT;
  };

  const scaleLabels = ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Hampir Selalu"];
  const risk = getRiskBadge(screening.ai?.riskLevel);
  const status = getStatusBadge();

  // Group answers by instrument
  const groupedAnswers = screening.answers.reduce((acc, answer) => {
    const key = answer.question.instrument;
    if (!acc[key]) acc[key] = [];
    acc[key].push(answer);
    return acc;
  }, {} as Record<string, typeof screening.answers>);

  const instrumentLabels: Record<string, string> = {
    GAD7: "GAD-7 (Kecemasan)",
    PHQ9: "PHQ-9 (Depresi)",
    SRQ20: "SRQ-20 (Kesehatan Umum)",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/screening"
          className="p-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detail Skrining
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
              {status.text}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            {formatDate(screening.createdAt)}
          </p>
        </div>
        {screening.status === "SUBMITTED" && (
          <AnalyzeButton screeningId={screening.id} />
        )}
        {screening.status === "AI_ANALYZED" && (
          <Link
            href={`/validation/${screening.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Validasi
          </Link>
        )}
      </div>

      {/* Patient Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <Link
              href={`/patients/${screening.patient.id}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {screening.patient.fullName}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              NIK: {screening.patient.nik} • {screening.patient.gender === "MAN" ? "Laki-laki" : "Perempuan"}
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {screening.ai && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hasil Analisis AI</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className={`rounded-xl p-4 border ${risk.class}`}>
                <p className="text-xs font-medium opacity-70 mb-1">Tingkat Risiko</p>
                <p className="text-xl font-bold">{risk.text}</p>
              </div>
              <div className="rounded-xl p-4 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Skor</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{screening.ai.totalScore}</p>
              </div>
              <div className="rounded-xl p-4 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Kepercayaan AI</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round(screening.ai.confidence * 100)}%
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</p>
              <p className="text-sm text-gray-900 dark:text-white font-semibold">{screening.ai.category}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ringkasan</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{screening.ai.summary}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alasan AI</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{screening.ai.reasoning}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parseJson(screening.ai.majorSymptoms).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gejala Mayor</p>
                  <ul className="space-y-1">
                    {parseJson(screening.ai.majorSymptoms).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parseJson(screening.ai.minorSymptoms).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gejala Minor</p>
                  <ul className="space-y-1">
                    {parseJson(screening.ai.minorSymptoms).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {parseJson(screening.ai.emergencyFlags).length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Peringatan Darurat</p>
                </div>
                <ul className="space-y-1">
                  {parseJson(screening.ai.emergencyFlags).map((flag, i) => (
                    <li key={i} className="text-sm text-red-600 dark:text-red-400">{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nurse Validation */}
      {screening.validation && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Validasi Perawat</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Keputusan</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  screening.validation.decision === "APPROVED"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : screening.validation.decision === "REVISED"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {screening.validation.decision === "APPROVED" ? "Disetujui" : screening.validation.decision === "REVISED" ? "Direvisi" : "Ditolak"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Divalidasi Oleh</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{screening.validation.nurse.fullName}</p>
              </div>
              {screening.validation.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Catatan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{screening.validation.notes}</p>
                </div>
              )}
              {screening.validation.revisedRiskLevel && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risiko Direvisi</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskBadge(screening.validation.revisedRiskLevel).class}`}>
                    {getRiskBadge(screening.validation.revisedRiskLevel).text}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Diagnoses */}
      {screening.diagnoses.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Diagnosis Keperawatan (SDKI)</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {screening.diagnoses.map((sd, index) => (
              <div key={sd.id} className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <Link
                      href={`/diagnosis/${sd.diagnosis.id}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {sd.diagnosis.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sd.diagnosis.code}</p>
                  </div>
                </div>

                {sd.outcomes.length > 0 && (
                  <div className="ml-9 mb-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Luaran (SLKI)
                    </p>
                    <ul className="space-y-1">
                      {sd.outcomes.map((so) => (
                        <li key={so.id} className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-xs text-gray-400 mr-1">{so.outcome.code}</span>
                          {so.outcome.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sd.interventions.length > 0 && (
                  <div className="ml-9">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Intervensi (SIKI)
                    </p>
                    <ul className="space-y-1">
                      {sd.interventions.map((si) => (
                        <li key={si.id} className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-xs text-gray-400 mr-1">{si.intervention.code}</span>
                          {si.intervention.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Answers */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Jawaban Kuesioner</h2>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {screening.answers.length} pertanyaan
          </span>
        </div>
        <div className="p-6 space-y-8">
          {Object.entries(groupedAnswers).map(([instrument, answers]) => (
            <div key={instrument}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-slate-700">
                {instrumentLabels[instrument] || instrument}
              </h3>
              <div className="space-y-4">
                {answers.map((answer, idx) => (
                  <div key={answer.id} className="flex items-start gap-4">
                    <span className="text-xs text-gray-400 w-6 text-right shrink-0 mt-1">{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{answer.question.text}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4].map((score) => (
                            <div
                              key={score}
                              className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                                answer.score === score
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 dark:bg-slate-700 text-gray-400"
                              }`}
                            >
                              {score}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          = {scaleLabels[answer.score] || answer.score}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScreeningDetailPage;
