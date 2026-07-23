import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session_id";

export async function GET() {
  try {
    // Authenticate patient
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionId?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId.value, isActive: true },
    }).catch(() => null);

    if (!user || user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get patient by userId
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch all questions grouped by instrument
    const questions = await prisma.question.findMany({
      orderBy: [{ instrument: "asc" }, { order: "asc" }],
      select: {
        id: true,
        text: true,
        instrument: true,
        order: true,
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
