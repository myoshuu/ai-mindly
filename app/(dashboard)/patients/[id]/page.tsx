import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
  CheckCircle,
  Clock,
  Activity,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const PatientDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true } },
      screenings: {
        orderBy: { createdAt: "desc" },
        include: {
          ai: {
            select: {
              riskLevel: true,
              totalScore: true,
              category: true,
              confidence: true,
            },
          },
          validation: { select: { decision: true } },
          _count: { select: { answers: true } },
        },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatDateTime = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getRiskBadge = (riskLevel?: string | null) => {
    switch (riskLevel) {
      case "HIGH":
      case "SEVERE":
        return { text: "Tinggi", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
      case "MODERATE":
        return { text: "Sedang", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "MILD":
        return { text: "Ringan", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      case "MINIMAL":
        return { text: "Minimal", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      case "NONE":
        return { text: "Tidak Ada", class: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
      default:
        return { text: "N/A", class: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" };
    }
  };

  const getStatusBadge = (status: string, validation?: { decision: string } | null) => {
    if (validation) {
      const map: Record<string, { text: string; class: string; icon: typeof CheckCircle }> = {
        APPROVED: { text: "Disetujui", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
        REVISED: { text: "Direvisi", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Activity },
        REJECTED: { text: "Ditolak", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertTriangle },
      };
      return map[validation.decision] || map.APPROVED;
    }
    const statusMap: Record<string, { text: string; class: string; icon: typeof Clock }> = {
      DRAFT: { text: "Draft", class: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300", icon: Clock },
      SUBMITTED: { text: "Menunggu Analisis", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
      AI_ANALYZED: { text: "Menunggu Validasi", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: AlertTriangle },
      VALIDATED: { text: "Tervalidasi", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
      COMPLETED: { text: "Selesai", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
    };
    return statusMap[status] || statusMap.DRAFT;
  };

  const latestScreening = patient.screenings[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/patients"
          className="p-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {patient.fullName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            NIK: {patient.nik}
          </p>
        </div>
        <div className="ml-auto">
          <Link
            href={`/screening/new?patientId=${patient.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Mulai Skrining
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Card */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {patient.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {patient.fullName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {patient.gender === "MAN" ? "Laki-laki" : "Perempuan"} • {calculateAge(patient.birthDate)} tahun
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">NIK</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.nik}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal Lahir</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(patient.birthDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nomor Telepon</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Alamat</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.address}</p>
                </div>
              </div>
              {patient.emergencyContact && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kontak Darurat</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.emergencyContact}</p>
                    {patient.emergencyPhone && (
                      <p className="text-xs text-gray-500">{patient.emergencyPhone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Statistik</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Skrining</span>
                <span className="font-semibold text-gray-900 dark:text-white">{patient.screenings.length}</span>
              </div>
              {latestScreening?.ai && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Risiko Terakhir</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskBadge(latestScreening.ai.riskLevel).class}`}>
                      {getRiskBadge(latestScreening.ai.riskLevel).text}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Skor Terakhir</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{latestScreening.ai.totalScore}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Terdaftar Sejak</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(patient.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Screening History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Riwayat Skrining
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {patient.screenings.length} skrining
              </span>
            </div>

            {patient.screenings.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {patient.screenings.map((screening) => {
                  const risk = getRiskBadge(screening.ai?.riskLevel);
                  const statusBadge = getStatusBadge(screening.status, screening.validation);

                  return (
                    <Link
                      key={screening.id}
                      href={`/screening/${screening.id}`}
                      className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.class}`}>
                              {statusBadge.text}
                            </span>
                            {screening.ai && (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${risk.class}`}>
                                {risk.text}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(screening.createdAt)}
                          </p>
                          {screening.ai && (
                            <p className="text-xs text-gray-400 mt-1">
                              Skor: {screening.ai.totalScore} • {screening.ai.category}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Belum ada riwayat skrining
                </p>
                <Link
                  href={`/screening/new?patientId=${patient.id}`}
                  className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Mulai Skrining Pertama
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
