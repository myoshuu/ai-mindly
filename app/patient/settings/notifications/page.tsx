import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Clock, Info } from "lucide-react";

const SESSION_COOKIE_NAME = "session_id";

const PatientNotificationsPage = async () => {
  // Fetch current user and patient from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

  let user = null;

  if (sessionId?.value) {
    user = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
    }).catch(() => null);
  }

  // Fetch notifications for this user
  const notifications = user
    ? await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }).catch(() => [])
    : [];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} menit yang lalu`;
    } else if (hours < 24) {
      return `${hours} jam yang lalu`;
    } else if (days < 7) {
      return `${days} hari yang lalu`;
    } else {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  };

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const baseClass = "w-10 h-10 rounded-lg flex items-center justify-center shrink-0";

    if (!isRead) {
      switch (type) {
        case "HIGH_RISK":
          return { className: `${baseClass} bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400`, icon: AlertCircle };
        case "VALIDATION_PENDING":
          return { className: `${baseClass} bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400`, icon: Clock };
        case "NEW_PATIENT":
          return { className: `${baseClass} bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400`, icon: Bell };
        default:
          return { className: `${baseClass} bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300`, icon: Info };
      }
    }

    return { className: `${baseClass} bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500`, icon: CheckCircle };
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "HIGH_RISK":
        return "Risiko Tinggi";
      case "VALIDATION_PENDING":
        return "Menunggu Validasi";
      case "NEW_PATIENT":
        return "Pasien Baru";
      case "REPORT_READY":
        return "Laporan Siap";
      default:
        return "Informasi";
    }
  };

  return (
    <div className="min-h-screen bg-sky-50/50 dark:bg-slate-900 max-w-md mx-auto relative shadow-2xl border-x border-gray-100 dark:border-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/patient/settings"
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Notifikasi
            </h1>
          </div>
          <span className="text-xs text-gray-400">
            {notifications.filter(n => !n.isRead).length} belum dibaca
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const { className, icon: Icon } = getNotificationIcon(notification.type, notification.isRead);

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                  notification.isRead
                    ? "bg-gray-50 dark:bg-slate-800/50 opacity-75"
                    : "bg-white dark:bg-slate-800 shadow-sm"
                }`}
              >
                <div className={className}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-sm font-medium leading-tight ${
                        notification.isRead
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Tidak Ada Notifikasi</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Notifikasi akan muncul di sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientNotificationsPage;
