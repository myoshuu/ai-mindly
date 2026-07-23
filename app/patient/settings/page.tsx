import Link from "next/link";
import { ArrowLeft, User, Bell, Shield, HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import LogoutButton from "./LogoutButton";

const SESSION_COOKIE_NAME = "session_id";

const PatientSettingsPage = async () => {
  // Fetch current user and patient from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

  let user = null;
  let patient = null;

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
  const email = user?.email || "-";
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const registeredDate = patient?.createdAt
    ? new Date(patient.createdAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "-";

  const menuItems = [
    { icon: User, label: "Edit Profil", href: "/patient/settings/profile" },
    { icon: Bell, label: "Notifikasi", href: "/patient/settings/notifications" },
    { icon: Shield, label: "Privasi & Keamanan", href: "/patient/settings/privacy" },
    { icon: HelpCircle, label: "Bantuan", href: "/patient/settings/help" },
  ];

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
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Profil
          </h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {displayName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {email}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Pasien • Terdaftar sejak {registeredDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="px-6 pt-4">
        <LogoutButton />
      </div>
    </div>
  );
};

export default PatientSettingsPage;
