import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";

const SESSION_COOKIE_NAME = "session_id";

const PatientResultsPage = async () => {
  // Fetch current user and patient from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

  let patient = null;
  let screening = null;
  let aiAnalysis = null;

  if (sessionId?.value) {
    const user = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
    }).catch(() => null);

    if (user && user.role === "PATIENT") {
      patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      }).catch(() => null);

      if (patient) {
        // Get latest screening with AI analysis
        screening = await prisma.screening.findFirst({
          where: { patientId: patient.id },
          orderBy: { createdAt: "desc" },
          include: {
            ai: true,
            validation: { select: { decision: true, notes: true } },
          },
        }).catch(() => null);

        if (screening) {
          aiAnalysis = screening.ai;
        }
      }
    }
  }

  // Helper functions
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
  const recommendations = aiAnalysis?.recommendations
    ? JSON.parse(aiAnalysis.recommendations)
    : [];
  const majorSymptoms = aiAnalysis?.majorSymptoms
    ? JSON.parse(aiAnalysis.majorSymptoms)
    : [];

  // Calculate percentage for gauge (based on totalScore vs max possible)
  const maxScore = 63; // Approximate max for combined GAD7 + PHQ9
  const percentage = aiAnalysis ? Math.min(100, (aiAnalysis.totalScore / maxScore) * 100) : 0;

  if (!screening || !aiAnalysis) {
    return (
      <div className="min-h-screen bg-sky-50/50 dark:bg-slate-900 max-w-md mx-auto relative shadow-2xl p-6 flex flex-col justify-center border-x border-gray-100 dark:border-slate-800 text-center">
        <div className="space-y-4">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Hasil Analisis
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belum ada hasil analisis. Silakan lakukan skrining terlebih dahulu.
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
    <div className="min-h-screen bg-sky-50/50 dark:bg-slate-900 max-w-md mx-auto relative shadow-2xl p-6 flex flex-col justify-between border-x border-gray-100 dark:border-slate-800 text-center">

      <div className="space-y-6 pt-4">
        {/* Title */}
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Hasil Analisis AI
        </h1>

        {/* Circular Ring Gauge */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-4">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="3.5"
            />
            {/* Active ring segment */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={`#${riskInfo.color.includes('-') ? 'F59E0B' : 'F59E0B'}`}
              strokeWidth="4"
              strokeDasharray={`${percentage}, 100`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              TINGKAT RISIKO
            </span>
            <span className={`text-lg font-black tracking-wide mt-0.5 uppercase text-${riskInfo.color}`}>
              {riskInfo.text}
            </span>
          </div>
        </div>

        {/* Category */}
        <div className={`inline-block px-3 py-1.5 rounded-full ${riskInfo.bg} border border-current/10`}>
          <span className={`text-xs font-bold text-${riskInfo.color}`}>
            {aiAnalysis.category}
          </span>
        </div>

        {/* Description Paragraph */}
        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium px-4 leading-relaxed">
          {aiAnalysis.summary}
        </p>

        {/* Major Symptoms */}
        {majorSymptoms.length > 0 && (
          <div className="bg-red-50/70 dark:bg-slate-800/80 rounded-xl p-4 text-left border border-red-100 dark:border-slate-700 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Gejala Utama</h2>
            <ul className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium space-y-1">
              {majorSymptoms.slice(0, 3).map((symptom: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations Preview */}
        {recommendations.length > 0 && (
          <div className="bg-blue-50/70 dark:bg-slate-800/80 rounded-xl p-4 text-left border border-blue-100 dark:border-slate-700 space-y-1.5 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Saran Awal</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {recommendations[0]}
            </p>
          </div>
        )}

        {/* Confidence */}
        <div className="text-xs text-gray-400">
          Tingkat kepercayaan: {Math.round(aiAnalysis.confidence * 100)}%
        </div>
      </div>

      {/* Bottom Button & Disclaimer */}
      <div className="space-y-3 pb-4">
        <Link
          href="/patient/recommendations"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all"
        >
          Lihat Rekomendasi Lengkap
        </Link>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
          Hasil ini bukan diagnosis klinis.
        </p>
      </div>

    </div>
  );
};

export default PatientResultsPage;
