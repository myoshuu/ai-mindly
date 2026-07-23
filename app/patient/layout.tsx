import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PatientNav from "./PatientNav";

const SESSION_COOKIE_NAME = "session_id";

const PatientLayout = async ({ children }: { children: React.ReactNode }) => {
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

  // If no user or not a patient, redirect to dashboard (nurse/admin) or login
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "PATIENT") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-sky-50/50 dark:bg-slate-900 flex justify-center">
      {/* Mobile Container - fixed width, full height */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-x border-gray-100 dark:border-slate-800 flex flex-col">
        {/* Page Content - scrollable, takes remaining space */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Bottom Navigation Bar */}
        <PatientNav />
      </div>
    </div>
  );
};

export default PatientLayout;
