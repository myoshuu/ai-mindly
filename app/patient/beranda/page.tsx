import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import PatientBerandaClient from "./PatientBerandaClient";

const SESSION_COOKIE_NAME = "session_id";

const PatientBerandaPage = async () => {
  // Fetch current user and patient from session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

  let user = null;
  let patient = null;
  let lastScreening = null;

  if (sessionId?.value) {
    user = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
    }).catch(() => null);

    if (user && user.role === "PATIENT") {
      patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      }).catch(() => null);

      if (patient) {
        lastScreening = await prisma.screening.findFirst({
          where: { patientId: patient.id },
          orderBy: { createdAt: "desc" },
          include: {
            ai: { select: { riskLevel: true } },
            validation: { select: { decision: true } },
          },
        }).catch(() => null);
      }
    }
  }

  const displayName = patient?.fullName || user?.fullName || "Amanda";
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  // Format last screening date
  const lastScreeningDate = lastScreening
    ? new Date(lastScreening.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  // Get risk level for display
  const getRiskLabel = (riskLevel: string | null) => {
    switch (riskLevel) {
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

  return (
    <PatientBerandaClient
      displayName={displayName}
      initials={initials}
      lastScreeningDate={lastScreeningDate}
      hasCompletedScreening={!!lastScreening}
      riskLevel={lastScreening?.ai?.riskLevel || null}
      riskLabel={getRiskLabel(lastScreening?.ai?.riskLevel || null)}
    />
  );
};

export default PatientBerandaPage;
