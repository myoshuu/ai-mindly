import { Sidebar } from "@/components/dashboard/sidebar";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "session_id";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  // Fetch user from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

  let user = null;
  if (sessionId?.value) {
    user = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
      select: { id: true, fullName: true, role: true },
    }).catch(() => null);
  }

  // Redirect patients to patient dashboard
  if (user?.role === "PATIENT") {
    redirect("/patient/beranda");
  }

  const userName = user?.fullName || "Pengguna";
  const userRole = user?.role || "NURSE";

  // Get notification count
  let notificationCount = 0;
  if (user) {
    notificationCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }).catch(() => 0);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar
        userRole={userRole}
        userName={userName}
        notificationCount={notificationCount}
      />
      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
