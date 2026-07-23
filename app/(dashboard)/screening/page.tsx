import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardList, Plus, Search, Filter, Eye, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const ScreeningPage = async () => {
  const screenings = await prisma.screening.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { fullName: true, nik: true } },
      ai: { select: { riskLevel: true, confidence: true, totalScore: true } },
      validation: { select: { decision: true } },
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

  const getStatusBadge = (status: string, validation?: { decision: string } | null) => {
    if (validation) {
      return {
        icon: CheckCircle,
        text: validation.decision === "APPROVED" ? "Disetujui" : validation.decision === "REVISED" ? "Direvisi" : "Ditolak",
        class: validation.decision === "APPROVED"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : validation.decision === "REVISED"
          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
    }

    switch (status) {
      case "DRAFT":
        return { icon: Clock, text: "Draft", class: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
      case "SUBMITTED":
        return { icon: Clock, text: "Menunggu Analisis", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      case "AI_ANALYZED":
        return { icon: AlertTriangle, text: "Menunggu Validasi", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "VALIDATED":
        return { icon: CheckCircle, text: "Divalidasi", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      case "COMPLETED":
        return { icon: CheckCircle, text: "Selesai", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      default:
        return { icon: Clock, text: status, class: "bg-gray-100 text-gray-700" };
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;

    switch (riskLevel) {
      case "HIGH":
      case "SEVERE":
        return { text: riskLevel, class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
      case "MODERATE":
        return { text: "Sedang", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "MILD":
        return { text: "Ringan", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      case "MINIMAL":
        return { text: "Minimal", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      default:
        return { text: riskLevel, class: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hasil Skrining
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola dan lihat hasil skrining kesehatan mental
          </p>
        </div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Skrining Baru
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pasien..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Screenings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pasien
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Skor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tingkat Risiko
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {screenings.length > 0 ? (
                screenings.map((screening: any) => {
                  const status = getStatusBadge(screening.status, screening.validation);
                  const risk = getRiskBadge(screening.ai?.riskLevel);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={screening.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {screening.patient.fullName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          NIK: {screening.patient.nik}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(screening.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {screening.ai ? (
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {screening.ai.totalScore}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.round(screening.ai.confidence * 100)}% confidence
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {risk ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${risk.class}`}>
                            {risk.text}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/screening/${screening.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">
                      Belum ada data skrining
                    </p>
                    <Link
                      href="/patients"
                      className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Mulai Skrining Baru
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScreeningPage;
