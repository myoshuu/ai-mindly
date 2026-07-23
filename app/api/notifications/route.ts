import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = async (request: NextRequest) => {
  const encoder = new TextEncoder();
  let isConnected = true;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

      // Poll for new notifications every 5 seconds
      const interval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(interval);
          return;
        }

        try {
          // Get pending validations count
          const pendingValidations = await prisma.screening.count({
            where: { status: "AI_ANALYZED" },
          });

          // Get new notifications
          const notifications = await prisma.notification.findMany({
            where: { isRead: false },
            orderBy: { createdAt: "desc" },
            take: 5,
          });

          // Get high risk count
          const highRiskCount = await prisma.screening.count({
            where: {
              OR: [
                { ai: { riskLevel: "HIGH" } },
                { ai: { riskLevel: "SEVERE" } },
              ],
            },
          });

          // Send update
          const data = JSON.stringify({
            type: "update",
            pendingValidations,
            highRiskCount,
            notifications,
            timestamp: new Date().toISOString(),
          });

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          console.error("SSE Error:", error);
        }
      }, 5000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        isConnected = false;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
