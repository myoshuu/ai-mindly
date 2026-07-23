import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  AlertTriangle,
  User,
  Activity,
  Target,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { cookies } from "next/headers";
import { ValidationForm } from "./validation-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SESSION_COOKIE_NAME = "session_id";

const ValidationDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  // Get current nurse
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);
  let currentUser = null;
  if (sessionId?.value) {
    currentUser = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
      select: { id: true, fullName: true, role: true },
    }).catch(() => null);
  }

  if (!currentUser || (currentUser.role !== "NURSE" && currentUser.role !== "ADMIN")) {
    redirect("/");
  }

  const screening = await prisma.screening.findUnique({
    where: { id },
    include: {
      patient: {
        select: { id: true, fullName: true, nik: true, birthDate: true, gender: true },
      },
      answers: {
        include: { question: true },
        orderBy: { question: { order: "asc" } },
      },
      ai: true,
      validation: {
        include: { nurse: { select: { fullName: true } } },
      },
    },
  });

  if (!screening) {
    notFound();
  }

  // Already validated
  if (screening.validation) {
    redirect(`/screening/${id}`);
  }

  if (screening.status !== "AI_ANALYZED") {
    redirect(`/screening/${id}`);
  }

  const parseJson = (str: string): string[] => {
    try { return JSON.parse(str); } catch { return []; }
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getRiskBadge = (riskLevel?: string | null) => {
    switch (riskLevel) {
      case "HIGH": case "SEVERE":
        return { text: "Risiko Tinggi", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
      case "MODERATE":
        return { text: "Risiko Sedang", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "MILD":
        return { text: "Risiko Ringan", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      case "MINIMAL": case "NONE":
        return { text: "Minimal", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      default:
        return { text: "N/A", class: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" };
    }
  };

  const availableDiagnoses = await prisma.diagnosis.findMany({
    where: { isActive: true },
    select: { id: true, code: true, title: true, category: true },
    orderBy: { code: "asc" },
  });

  const risk = getRiskBadge(screening.ai?.riskLevel);
  const scaleLabels = ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Hampir Selalu"];

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
          href="/validation"
          className="p-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Validasi Skrining</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">{formatDate(screening.createdAt)}</p>
        </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: AI Analysis */}
        <div className="space-y-6">
          {/* AI Results */}
          {screening.ai && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hasil Analisis AI</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-xl p-3 border ${risk.class}`}>
                    <p className="text-xs opacity-70 mb-1">Risiko</p>
                    <p className="font-bold text-sm">{risk.text}</p>
                  </div>
                  <div className="rounded-xl p-3 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skor</p>
                    <p className="font-bold text-gray-900 dark:text-white">{screening.ai.totalScore}</p>
                  </div>
                  <div className="rounded-xl p-3 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Keyakinan</p>
                    <p className="font-bold text-gray-900 dark:text-white">{Math.round(screening.ai.confidence * 100)}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Kategori</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{screening.ai.category}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Ringkasan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{screening.ai.summary}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Alasan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{screening.ai.reasoning}</p>
                </div>

                {parseJson(screening.ai.emergencyFlags).length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Peringatan Darurat</p>
                    </div>
                    <ul className="space-y-1">
                      {parseJson(screening.ai.emergencyFlags).map((flag, i) => (
                        <li key={i} className="text-sm text-red-600 dark:text-red-400">• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questionnaire Answers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Jawaban Kuesioner</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{screening.answers.length} pertanyaan</p>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(groupedAnswers).map(([instrument, answers]) => (
                <div key={instrument}>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {instrumentLabels[instrument] || instrument}
                  </h3>
                  <div className="space-y-3">
                    {answers.map((answer, idx) => (
                      <div key={answer.id} className="flex items-start gap-3">
                        <span className="text-xs text-gray-400 w-5 text-right shrink-0 mt-1">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{answer.question.text}</p>
                          <div className="flex items-center gap-1.5">
                            {[0, 1, 2, 3, 4].map((score) => (
                              <div
                                key={score}
                                className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center ${
                                  answer.score === score
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-400"
                                }`}
                              >
                                {score}
                              </div>
                            ))}
                            <span className="text-xs text-gray-400 ml-1">
                              {scaleLabels[answer.score]}
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

        {/* Right: Validation Form */}
        <div>
          <ValidationForm
            screeningId={id}
            nurseId={currentUser.id}
            nurseName={currentUser.fullName}
            availableDiagnoses={availableDiagnoses}
            aiRiskLevel={screening.ai?.riskLevel || "MODERATE"}
            recommendedDiagnoses={parseJson(screening.ai?.recommendedDiagnoses || "[]")}
          />
        </div>
      </div>
    </div>
  );
};

export default ValidationDetailPage;
