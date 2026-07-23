import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, Eye, XCircle, User, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const ValidationPage = async () => {
  const screenings = await prisma.screening.findMany({
    where: { status: "AI_ANALYZED" },
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { fullName: true, nik: true } },
      ai: true,
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return { text: "N/A", class: "bg-gray-100 text-gray-700" };

    switch (riskLevel) {
      case "HIGH":
      case "SEVERE":
        return { text: "Tinggi", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
      case "MODERATE":
        return { text: "Sedang", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "MILD":
        return { text: "Ringan", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      default:
        return { text: riskLevel, class: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Validasi AI
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Tinjaun dan validasi hasil skrining dari AI
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {screenings.length}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Menunggu Validasi
              </p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {screenings.filter((s: any) => s.ai?.riskLevel === "HIGH" || s.ai?.riskLevel === "SEVERE").length}
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                Risiko Tinggi
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {await prisma.screening.count({ where: { status: "VALIDATED" } })}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                Sudah Divalidasi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Skrining Menunggu Validasi
          </h2>
        </div>

        {screenings.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {screenings.map((screening: any) => {
              const risk = getRiskBadge(screening.ai?.riskLevel);

              return (
                <div key={screening.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {screening.patient.fullName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          NIK: {screening.patient.nik} • {formatDate(screening.createdAt)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${risk.class}`}>
                            {risk.text}
                          </span>
                          <span className="text-sm text-gray-500">
                            Skor: <span className="font-medium">{screening.ai?.totalScore || "-"}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            Confidence: <span className="font-medium">{screening.ai ? `${Math.round(screening.ai.confidence * 100)}%` : "-"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/validation/${screening.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Validasi
                      </Link>
                    </div>
                  </div>

                  {screening.ai && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kategori AI
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {screening.ai.category}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {screening.ai.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Semua skrining sudah divalidasi!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPage;
