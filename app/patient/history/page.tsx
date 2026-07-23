import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ArrowLeft, FileText, Calendar, CheckCircle } from "lucide-react";

const SESSION_COOKIE_NAME = "session_id";

const PatientHistoryPage = async () => {
  // Fetch current user and patient from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

  let patient = null;

  if (sessionId?.value) {
    const user = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
    }).catch(() => null);

    if (user && user.role === "PATIENT") {
      patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      }).catch(() => null);
    }
  }

  // Fetch patient's screening history
  const screenings = patient
    ? await prisma.screening.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" },
        include: {
          ai: { select: { riskLevel: true, totalScore: true } },
          validation: { select: { decision: true } },
        },
      }).catch(() => [])
    : [];

  const getRiskColor = (risk: string | undefined | null) => {
    switch (risk) {
      case "HIGH":
      case "SEVERE":
        return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400";
      case "MILD":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400";
      case "MINIMAL":
        return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRiskLabel = (risk: string | undefined | null) => {
    switch (risk) {
      case "HIGH":
      case "SEVERE":
        return "Tinggi";
      case "MODERATE":
        return "Sedang";
      case "MILD":
        return "Ringan";
      case "MINIMAL":
        return "Minimal";
      default:
        return "N/A";
    }
  };

  const getScreeningType = () => {
    // Simple type detection based on instruments used
    return "Skrining Kesehatan Mental";
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/patient/beranda"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Riwayat Skrining
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {screenings.length} skrining telah dilakukan
            </p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="p-6 space-y-4">
        {screenings.length > 0 ? (
          screenings.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      {getScreeningType()}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getRiskColor(item.ai?.riskLevel)}`}>
                  {getRiskLabel(item.ai?.riskLevel)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Skor:</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {item.ai?.totalScore ?? "-"}
                  </span>
                </div>
                <Link
                  href="/patient/results"
                  className="text-xs font-bold text-[#0066FF] hover:underline"
                >
                  Lihat Detail →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Belum Ada Riwayat</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Skrining yang Anda lakukan akan muncul di sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistoryPage;
