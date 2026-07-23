import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle, BookOpen, Phone } from "lucide-react";

const SESSION_COOKIE_NAME = "session_id";

const PatientRecommendationsPage = async () => {
  // Fetch current user and patient from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

  let aiAnalysis = null;

  if (sessionId?.value) {
    const user = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
    }).catch(() => null);

    if (user && user.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      }).catch(() => null);

      if (patient) {
        // Get latest screening with AI analysis
        const screening = await prisma.screening.findFirst({
          where: { patientId: patient.id },
          orderBy: { createdAt: "desc" },
          include: { ai: true },
        }).catch(() => null);

        aiAnalysis = screening?.ai;
      }
    }
  }

  // Parse recommendations from JSON
  const recommendations = aiAnalysis?.recommendations
    ? JSON.parse(aiAnalysis.recommendations)
    : [];

  const possibleCauses = aiAnalysis?.possibleCauses
    ? JSON.parse(aiAnalysis.possibleCauses)
    : [];

  const emergencyFlags = aiAnalysis?.emergencyFlags
    ? JSON.parse(aiAnalysis.emergencyFlags)
    : [];

  const getRiskColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "HIGH":
      case "SEVERE":
        return { color: "rose-500", bg: "bg-rose-50 dark:bg-rose-950/40", text: "Tinggi" };
      case "MODERATE":
        return { color: "amber-500", bg: "bg-amber-50 dark:bg-amber-950/40", text: "Sedang" };
      case "MILD":
        return { color: "blue-500", bg: "bg-blue-50 dark:bg-blue-950/40", text: "Ringan" };
      case "MINIMAL":
        return { color: "emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "Minimal" };
      default:
        return { color: "gray-400", bg: "bg-gray-50 dark:bg-gray-950/40", text: "N/A" };
    }
  };

  const riskInfo = getRiskColor(aiAnalysis?.riskLevel || null);

  if (!aiAnalysis) {
    return (
      <div className="min-h-screen bg-sky-50/50 dark:bg-slate-900 max-w-md mx-auto relative shadow-2xl p-6 flex flex-col justify-center border-x border-gray-100 dark:border-slate-800 text-center">
        <div className="space-y-4">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Rekomendasi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belum ada rekomendasi. Silakan lakukan skrining terlebih dahulu.
          </p>
          <Link
            href="/patient/screening"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all"
          >
            Mulai Skrining
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50/50 dark:bg-slate-900 max-w-md mx-auto relative shadow-2xl border-x border-gray-100 dark:border-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/patient/results"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Rekomendasi
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tingkat Risiko: <span className={`font-bold text-${riskInfo.color}`}>{riskInfo.text}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 pb-8">
        {/* Reasoning/Analysis */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            Analisis AI
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {aiAnalysis.reasoning}
          </p>
        </div>

        {/* Emergency Flags (if any) */}
        {emergencyFlags.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-200 dark:border-red-900/50 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                  Perhatian Khusus
                </h2>
                <ul className="space-y-1">
                  {emergencyFlags.map((flag: string, index: number) => (
                    <li key={index} className="text-xs text-red-600 dark:text-red-300">
                      • {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Rekomendasi
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Possible Causes */}
        {possibleCauses.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Kemungkinan Penyebab
            </h2>
            <div className="space-y-2">
              {possibleCauses.map((cause: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {cause}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Aksi Cepat
          </h2>

          <Link
            href="/patient/education"
            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-sm">Materi Edukasi</p>
              <p className="text-xs text-gray-500">Pelajari lebih lanjut tentang kesehatan mental</p>
            </div>
          </Link>

          <a
            href="tel:119ext8"
            className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-700 dark:text-red-400 text-sm">Bantuan Darurat</p>
              <p className="text-xs text-red-500 dark:text-red-300">119 ext 8 - Konseling Kesehatan Jiwa</p>
            </div>
          </a>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center font-medium pt-4">
          Hasil ini bukan diagnosis klinis. Silakan konsultasikan dengan tenaga kesehatan profesional.
        </p>
      </div>
    </div>
  );
};

export default PatientRecommendationsPage;
