import { prisma } from "@/lib/prisma";
import { Users, Sparkles, BellRing, Clock, ChevronDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const SESSION_COOKIE_NAME = "session_id";

const DashboardPage = async () => {
  // Fetch current user from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);
  let currentUser = null;
  if (sessionId?.value) {
    currentUser = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
      select: { fullName: true, role: true },
    }).catch(() => null);
  }

  // Fetch real data from database
  const [
    dbPatients,
    dbTodayScreenings,
    dbPendingValidations,
    dbHighRisk,
    screeningsList
  ] = await Promise.all([
    prisma.patient.count().catch(() => 0),
    prisma.screening.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }).catch(() => 0),
    prisma.screening.count({ where: { status: "AI_ANALYZED" } }).catch(() => 0),
    prisma.screening.count({
      where: { OR: [{ ai: { riskLevel: "HIGH" } }, { ai: { riskLevel: "SEVERE" } }] },
    }).catch(() => 0),
    prisma.screening.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { fullName: true, birthDate: true } },
        ai: { select: { riskLevel: true } },
        validation: { select: { decision: true } },
      },
    }).catch(() => []),
  ]);

  // Fetch recent activities (notifications and recent screenings)
  const [notifications, recentScreenings] = await Promise.all([
    prisma.notification.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true, role: true } } },
    }).catch(() => []),
    prisma.screening.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { fullName: true } },
        validation: { include: { nurse: { select: { fullName: true } } } },
      },
    }).catch(() => []),
  ]);

  // Fetch risk distribution for donut chart
  const riskDistribution = await prisma.aIAnalysis.groupBy({
    by: ["riskLevel"],
    _count: { riskLevel: true },
  }).catch(() => []);

  // Calculate percentages
  const totalRisks = riskDistribution.reduce((sum: number, r: { _count: { riskLevel: number } }) => sum + r._count.riskLevel, 0) || 1;
  const riskCounts = riskDistribution.reduce((acc: Record<string, number>, r: { riskLevel: string; _count: { riskLevel: number } }) => {
    acc[r.riskLevel] = r._count.riskLevel;
    return acc;
  }, {} as Record<string, number>);

  const highRiskPercent = Math.round(((riskCounts["HIGH"] || 0) + (riskCounts["SEVERE"] || 0)) / totalRisks * 100);
  const moderatePercent = Math.round(((riskCounts["MODERATE"] || 0) + (riskCounts["MILD"] || 0)) / totalRisks * 100);
  const lowRiskPercent = 100 - highRiskPercent - moderatePercent;

  // Build activity feed from real data
  const activities = [
    ...notifications.map(n => ({
      id: `notif-${n.id}`,
      type: n.type,
      title: n.message,
      time: n.createdAt,
      icon: n.type === "HIGH_RISK" ? "alert" : n.type === "VALIDATION_PENDING" ? "clock" : "info",
      user: n.user?.fullName || "System",
    })),
    ...recentScreenings.map(s => ({
      id: `screen-${s.id}`,
      type: "screening",
      title: s.validation
        ? `Validasi selesai oleh ${s.validation.nurse?.fullName || "Perawat"}`
        : `Skrining baru dari ${s.patient?.fullName || "Pasien"}`,
      time: s.validation?.validatedAt || s.createdAt,
      icon: s.validation ? "check" : "new",
      user: s.patient?.fullName || "Pasien",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const totalPatients = dbPatients;
  const todayScreenings = dbTodayScreenings;
  const highRiskCount = dbHighRisk;
  const pendingValidations = dbPendingValidations;

  // Get display name and initials
  const displayName = currentUser?.fullName || "Pengguna";
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const roleLabel = currentUser?.role === "ADMIN" ? "Administrator" : currentUser?.role === "NURSE" ? "Perawat" : "Pasien";
  const dashboardTitle = currentUser?.role === "ADMIN" ? "Dashboard Administrator" : currentUser?.role === "NURSE" ? "Dashboard Perawat" : "Dashboard";

  // Calculate age from birthDate
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - new Date(birthDate).getFullYear();
    return age;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get risk display info
  const getRiskInfo = (riskLevel?: string | null) => {
    if (!riskLevel) return { risk: "N/A", riskColor: "text-gray-400 bg-gray-50 dark:bg-gray-950/40" };
    switch (riskLevel) {
      case "HIGH":
      case "SEVERE":
        return { risk: "Tinggi", riskColor: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 font-semibold" };
      case "MODERATE":
        return { risk: "Sedang", riskColor: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" };
      case "MILD":
        return { risk: "Ringan", riskColor: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" };
      case "MINIMAL":
        return { risk: "Minimal", riskColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" };
      default:
        return { risk: riskLevel, riskColor: "text-gray-500 bg-gray-50" };
    }
  };

  // Get status display info
  const getStatusInfo = (validation?: { decision: string } | null) => {
    if (validation) {
      return {
        status: validation.decision === "APPROVED" ? "Validasi Selesai" : "Divalidasi",
        statusColor: "text-gray-500"
      };
    }
    return { status: "Menunggu Validasi", statusColor: "text-gray-600 font-medium" };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {dashboardTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-xs border border-blue-200">
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{displayName}</p>
            <p className="text-xs text-gray-400">{roleLabel}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Pengguna</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{totalPatients}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skrining Hari Ini</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{todayScreenings}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Risiko Tinggi</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{highRiskCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menunggu Validasi</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{pendingValidations}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Table (2 cols), Right Visuals (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Table "Daftar Hasil Skrining" */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Daftar Hasil Skrining
              </h2>
              <ChevronDown className="w-5 h-5 text-gray-400 cursor-pointer" />
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 font-semibold border-b border-gray-100 dark:border-slate-700/50">
                    <th className="pb-3 font-semibold">Nama</th>
                    <th className="pb-3 font-semibold">Usia</th>
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 font-semibold">Tingkat Risiko</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/40">
                  {screeningsList.length > 0 ? (
                    screeningsList.map((screening: any) => {
                      const { risk, riskColor } = getRiskInfo(screening.ai?.riskLevel);
                      const { status, statusColor } = getStatusInfo(screening.validation);
                      const age = screening.patient.birthDate ? calculateAge(screening.patient.birthDate) : "-";

                      return (
                        <tr key={screening.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-4 font-semibold text-gray-900 dark:text-white">{screening.patient.fullName}</td>
                          <td className="py-4 text-gray-600 dark:text-gray-300">{age}</td>
                          <td className="py-4 text-gray-500 dark:text-gray-400">{formatDate(screening.createdAt)}</td>
                          <td className="py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${riskColor}`}>
                              {risk}
                            </span>
                          </td>
                          <td className={`py-4 text-xs ${statusColor}`}>{status}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        Belum ada data skrining
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/screening"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#0066FF] hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-all"
            >
              Lihat Semua
            </Link>
          </div>
        </div>

        {/* Right Column: Donut Chart & Activity */}
        <div className="space-y-6">
          {/* Card 1: Distribusi Risiko */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Distribusi Risiko
            </h3>

            <div className="flex items-center justify-around py-4">
              {/* SVG Donut Chart */}
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  {/* Background track */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="4"
                  />
                  {/* Rendah (Blue) */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#0066FF"
                    strokeWidth="4.5"
                    strokeDasharray={`${lowRiskPercent}, 100`}
                    strokeDashoffset="0"
                  />
                  {/* Sedang (Orange) */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4.5"
                    strokeDasharray={`${moderatePercent}, 100`}
                    strokeDashoffset={`${-lowRiskPercent}`}
                  />
                  {/* Tinggi (Red) */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="4.5"
                    strokeDasharray={`${highRiskPercent}, 100`}
                    strokeDashoffset={`${-(lowRiskPercent + moderatePercent)}`}
                  />
                </svg>
              </div>

              {/* Legends */}
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span className="text-gray-600 dark:text-gray-300">Tinggi</span>
                  <span className="text-gray-900 dark:text-white font-bold ml-auto">{highRiskPercent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-gray-600 dark:text-gray-300">Sedang</span>
                  <span className="text-gray-900 dark:text-white font-bold ml-auto">{moderatePercent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                  <span className="text-gray-600 dark:text-gray-300">Rendah</span>
                  <span className="text-gray-900 dark:text-white font-bold ml-auto">{lowRiskPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Aktivitas Terbaru */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Aktivitas Terbaru
              </h3>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4 pt-1 text-xs">
              {activities.length > 0 ? (
                activities.map((activity) => {
                  const formatTime = (date: Date) => {
                    return new Date(date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  };

                  const getIcon = () => {
                    switch (activity.icon) {
                      case "check":
                        return <CheckCircle2 className="w-3 h-3" />;
                      case "alert":
                        return <BellRing className="w-3 h-3" />;
                      case "clock":
                        return <Clock className="w-3 h-3" />;
                      default:
                        return <Sparkles className="w-3 h-3" />;
                    }
                  };

                  const getIconStyle = () => {
                    switch (activity.icon) {
                      case "check":
                        return "bg-emerald-50 text-emerald-600 border-emerald-200";
                      case "alert":
                        return "bg-rose-50 text-rose-600 border-rose-200";
                      case "clock":
                        return "bg-amber-50 text-amber-600 border-amber-200";
                      default:
                        return "bg-blue-50 text-blue-600 border-blue-200";
                    }
                  };

                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${getIconStyle()}`}>
                        {getIcon()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{activity.title}</p>
                        <p className="text-gray-400 text-[11px]">{formatTime(activity.time)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada aktivitas</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;

