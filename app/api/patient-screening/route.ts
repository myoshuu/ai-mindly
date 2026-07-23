import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { analyzeScreening } from "@/actions/ai-analysis";
import { z } from "zod";

const SESSION_COOKIE_NAME = "session_id";

const patientScreeningSchema = z.object({
  instrument: z.enum(["GAD7", "PHQ9", "SRQ20"], {
    required_error: "Jenis skrining diperlukan",
  }),
  answers: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        score: z.number().int().min(0).max(4),
      })
    )
    .min(1, "Minimal satu jawaban diperlukan"),
});

export async function POST(request: Request) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = patientScreeningSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues?.[0]?.message || "Validasi gagal" },
        { status: 400 }
      );
    }

    const { instrument, answers } = validation.data;

    // Create screening with answers
    const screening = await prisma.screening.create({
      data: {
        patientId: patient.id,
        instrument: instrument as any,
        status: "SUBMITTED",
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            score: a.score,
          })),
        },
      },
    });

    // Trigger AI analysis
    await analyzeScreening({ screeningId: screening.id });

    return NextResponse.json({
      success: true,
      screeningId: screening.id,
    });
  } catch (error) {
    console.error("Error creating patient screening:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan skrining. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
