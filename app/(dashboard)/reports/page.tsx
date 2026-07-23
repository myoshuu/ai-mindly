import { prisma } from "@/lib/prisma";
import { ReportsDashboard } from "./reports-dashboard";

export const dynamic = "force-dynamic";

const ReportsPage = async () => {
  // Query database for reports stats
  const total = await prisma.screening.count();
  
  const highRisk = await prisma.screening.count({
    where: {
      ai: {
        riskLevel: {
          in: ["SEVERE", "HIGH"],
        },
      },
    },
  });

  const validated = await prisma.screening.count({
    where: {
      status: {
        in: ["VALIDATED", "COMPLETED"],
      },
    },
  });

  const draft = await prisma.screening.count({
    where: {
      status: "DRAFT",
    },
  });

  return (
    <ReportsDashboard
      initialStats={{ total, highRisk, validated, draft }}
    />
  );
};

export default ReportsPage;
