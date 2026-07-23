import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User } from "lucide-react";

const SESSION_COOKIE_NAME = "session_id";

const PatientProfilePage = async () => {
  // Fetch current user and patient from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

  let patient = null;
  let user = null;

  if (sessionId?.value) {
    user = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
    }).catch(() => null);

    if (user && user.role === "PATIENT") {
      patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      }).catch(() => null);
    }
  }

  const displayName = patient?.fullName || user?.fullName || "Pasien";
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getGenderLabel = (gender: string | null) => {
    switch (gender) {
      case "MAN":
        return "Laki-laki";
      case "WOMAN":
        return "Perempuan";
      default:
        return "-";
    }
  };

  return (
    <div className="min-h-screen bg-sky-50/50 dark:bg-slate-900 max-w-md mx-auto relative shadow-2xl border-x border-gray-100 dark:border-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/patient/settings"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Edit Profil
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-3xl font-bold mb-4">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {displayName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.email || "-"}
          </p>
        </div>

        {/* Profile Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Nama Lengkap</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {displayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.email || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Nomor Telepon</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {patient?.phone || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Tanggal Lahir</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(patient?.birthDate || null)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Jenis Kelamin</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getGenderLabel(patient?.gender || null)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Alamat</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {patient?.address || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Terdaftar Sejak</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(patient?.createdAt || null)}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          disabled
          className="w-full py-3 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 font-bold text-sm cursor-not-allowed"
        >
          Fitur edit akan segera hadir
        </button>
      </div>
    </div>
  );
};

export default PatientProfilePage;
