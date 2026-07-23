"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createScreeningSchema, validateScreeningSchema, assignDiagnosisSchema, z } from "@/lib/zod";

// Validation schemas removed - now imported from lib/zod.ts

export const createScreening = async (
  input: z.infer<typeof createScreeningSchema>
): Promise<{ error?: string; success?: boolean; screeningId?: string }> => {
  // Validate with Zod
  const validation = createScreeningSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "Validasi gagal" };
  }

  const { patientId, instrument, answers } = validation.data;

  try {
    const screening = await prisma.screening.create({
      data: {
        patientId,
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

    revalidatePath("/screening");
    return { success: true, screeningId: screening.id };

  } catch (error) {
    console.error("Error creating screening:", error);
    return { error: "Gagal membuat skrining. Silakan coba lagi." };
  }
};

export const validateScreening = async (
  input: z.infer<typeof validateScreeningSchema>
): Promise<{ error?: string; success?: boolean }> => {
  // Validate with Zod
  const validation = validateScreeningSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "Validasi gagal" };
  }

  const { screeningId, nurseId, decision, notes, revisedRiskLevel, revisedCategory, revisedScore } = validation.data;

  try {
    await prisma.nurseValidation.create({
      data: {
        screeningId,
        nurseId,
        decision,
        notes,
        revisedRiskLevel: revisedRiskLevel as any,
        revisedCategory,
        revisedScore,
      },
    });

    await prisma.screening.update({
      where: { id: screeningId },
      data: {
        status: decision === "APPROVED" ? "VALIDATED" : "AI_ANALYZED",
      },
    });

    // Create notification
    if (decision === "APPROVED") {
      await prisma.notification.create({
        data: {
          userId: nurseId,
          title: "Validasi Selesai",
          message: `Skrining telah divalidasi dan disetujui`,
          type: "VALIDATION_COMPLETED",
        },
      });
    }

    revalidatePath("/validation");
    revalidatePath("/screening");
    return { success: true };

  } catch (error) {
    console.error("Error validating screening:", error);
    return { error: "Gagal menyimpan validasi. Silakan coba lagi." };
  }
};

export const assignDiagnosis = async (
  input: z.infer<typeof assignDiagnosisSchema>
): Promise<{ error?: string; success?: boolean }> => {
  // Validate with Zod
  const validation = assignDiagnosisSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "Validasi gagal" };
  }

  const { screeningId, diagnosisIds, priorities, notes } = validation.data;

  try {
    // Delete existing diagnoses for this screening
    await prisma.screeningDiagnosis.deleteMany({
      where: { screeningId },
    });

    // Create new diagnoses
    for (const diagnosisId of diagnosisIds) {
      await prisma.screeningDiagnosis.create({
        data: {
          screeningId,
          diagnosisId,
          priority: priorities?.[diagnosisId] || 1,
          notes: notes?.[diagnosisId],
        },
      });
    }

    // Update screening status
    await prisma.screening.update({
      where: { id: screeningId },
      data: { status: "COMPLETED" },
    });

    revalidatePath("/screening");
    revalidatePath("/diagnosis");
    return { success: true };

  } catch (error) {
    console.error("Error assigning diagnosis:", error);
    return { error: "Gagal menyimpan diagnosis. Silakan coba lagi." };
  }
};
