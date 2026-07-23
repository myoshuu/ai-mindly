"use server";

import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { analyzeScreeningSchema, z } from "@/lib/zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
});

// Instrument-specific thresholds and info
const instrumentConfig: Record<
  string,
  {
    label: string;
    thresholds: {
      minimal: number;
      mild: number;
      moderate: number;
      severe: number;
    };
    description: string;
  }
> = {
  GAD7: {
    label: "GAD-7",
    description:
      "Generalized Anxiety Disorder - 7 pertanyaan tentang kecemasan",
    thresholds: { minimal: 4, mild: 9, moderate: 14, severe: 21 },
  },
  PHQ9: {
    label: "PHQ-9",
    description: "Patient Health Questionnaire - 9 pertanyaan tentang depresi",
    thresholds: { minimal: 4, mild: 9, moderate: 14, severe: 27 },
  },
  SRQ20: {
    label: "SRQ-20",
    description: "Self Reporting Questionnaire - 20 pertanyaan kesehatan umum",
    thresholds: { minimal: 8, mild: 12, moderate: 16, severe: 20 },
  },
};

// Get risk level based on instrument-specific thresholds
function getRiskLevel(instrument: string, score: number): string {
  const config = instrumentConfig[instrument];
  if (!config) return "MINIMAL";

  const { thresholds } = config;
  if (score >= thresholds.severe) return "SEVERE";
  if (score >= thresholds.moderate) return "MODERATE";
  if (score >= thresholds.mild) return "MILD";
  if (score >= thresholds.minimal) return "MINIMAL";
  return "NONE";
}

export const analyzeScreening = async (
  input: z.infer<typeof analyzeScreeningSchema>,
): Promise<{ error?: string; success?: boolean }> => {
  // Validate input with Zod
  const validation = analyzeScreeningSchema.safeParse(input);
  if (!validation.success) {
    const error = validation.error.issues?.[0];
    return { error: error?.message || "Validasi gagal" };
  }

  const { screeningId } = validation.data;

  try {
    // Get screening with answers
    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
      include: {
        answers: {
          include: { question: true },
        },
        patient: true,
      },
    });

    if (!screening) {
      return { error: "Skrining tidak ditemukan" };
    }

    // Get instrument from screening
    const instrument = screening.instrument || "SRQ20";
    const config = instrumentConfig[instrument];

    // Filter answers to only include the selected instrument's questions
    const relevantAnswers = screening.answers.filter(
      (a: { question: { instrument: string } }) =>
        a.question.instrument === instrument,
    );

    // Build prompt for Claude - only include relevant questions
    const answersText = relevantAnswers
      .map(
        (a: {
          question: { order: number; text: string; instrument: string };
          score: number;
        }) => `Q${a.question.order}: ${a.question.text}\nJawaban: ${a.score}`,
      )
      .join("\n\n");

    const totalScore = relevantAnswers.reduce(
      (sum: number, a: { score: number }) => sum + a.score,
      0,
    );
    const riskLevel = getRiskLevel(instrument, totalScore);

    const prompt = `Anda adalah asisten AI untuk analisis skrining kesehatan mental.

INSTRUMEN: ${config.label}
${config.description}

HASIL SKOR PASIEN:
${answersText}

Skor Total: ${totalScore}
Tingkat Risiko (berdasarkan ambang batas ${config.label}): ${riskLevel}

Pasien: ${screening.patient.fullName}
Tanggal Lahir: ${new Date(screening.patient.birthDate).toLocaleDateString("id-ID")}

Harap kembalikan hasil dalam format JSON dengan kolom-kolom berikut:
{
  "totalScore": angka skor total (${totalScore}),
  "confidence": nilai kepercayaan (0-1),
  "riskLevel": "NONE" | "MINIMAL" | "MILD" | "MODERATE" | "SEVERE" | "HIGH",
  "category": "Kategori hasil spesifik ${config.label} (misalnya: 'Anxiety Ringan', 'Depression Sedang', 'Kesehatan Mental Baik')",
  "summary": "Ringkasan hasil analisis dalam Bahasa Indonesia",
  "reasoning": "Proses penalaran dan analisis dalam Bahasa Indonesia",
  "majorSymptoms": ["Gejala utama 1", "Gejala utama 2"],
  "minorSymptoms": ["Gejala minor 1", "Gejala minor 2"],
  "possibleCauses": ["Penyebab potensial 1", "Penyebab potensial 2"],
  "recommendations": ["Rekomendasi 1", "Rekomendasi 2", "Rekomendasi 3"],
  "emergencyFlags": ["Tanda darurat (jika ada, atau array kosong)"]
}

Gunakan Bahasa Indonesia untuk hasil analisis. Fokuskan rekomendasi pada ${config.label}.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 2048,
      system: "Anda adalah asisten API yang HANYA membalas dengan dokumen JSON yang valid. Jangan sertakan teks penjelasan sebelum atau sesudah JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("CLAUDE MESSAGE CONTENT:", JSON.stringify(message.content, null, 2));

    // Find text in content blocks
    let responseText = "";
    if (message.content && Array.isArray(message.content)) {
      const textBlock = message.content.find((block: { type: string }) => block.type === "text");
      if (textBlock && "text" in textBlock) {
        responseText = (textBlock as { type: "text"; text: string }).text;
      }
    }

    // Parse JSON response
    let analysisData;
    try {
      // Try multiple extraction strategies
      let jsonStr: string | undefined;

      // Strategy 1: Extract from markdown code blocks
      const codeBlockMatch = responseText.match(
        /```(?:json)?\n?([\s\S]*?)\n?```/,
      );
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }

      // Strategy 2: Find first { and last } with balanced nesting
      if (!jsonStr) {
        const firstBrace = responseText.indexOf("{");
        if (firstBrace !== -1) {
          let depth = 0;
          let endIdx = -1;
          for (let i = firstBrace; i < responseText.length; i++) {
            if (responseText[i] === "{") depth++;
            else if (responseText[i] === "}") {
              depth--;
              if (depth === 0) {
                endIdx = i;
                break;
              }
            }
          }
          if (endIdx !== -1) {
            jsonStr = responseText.slice(firstBrace, endIdx + 1);
          }
        }
      }

      if (!jsonStr) {
        console.error(
          "RAW CLAUDE RESPONSE (NO JSON FOUND): [" + responseText + "]",
        );
        throw new Error("No JSON found");
      }

      try {
        analysisData = JSON.parse(jsonStr);
      } catch (e) {
        console.error("RAW JSON STR STRATEGY FAILED:", jsonStr);
        throw e;
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      // Fallback to basic analysis using instrument-specific thresholds
      const fallbackRiskLevel = getRiskLevel(instrument, totalScore);
      analysisData = {
        totalScore,
        confidence: 0.7,
        riskLevel: fallbackRiskLevel,
        category: `${config.label} - Skor Total: ${totalScore}`,
        summary: "Analisis selesai dengan metode sederhana",
        reasoning:
          "Gunakan metode penilaian sederhana karena terjadi kesalahan parsing",
        majorSymptoms: [],
        minorSymptoms: [],
        possibleCauses: [],
        recommendations: [],
        emergencyFlags: [],
      };
    }

    // Sanitize and validate riskLevel to match Prisma RiskLevel enum:
    // enum RiskLevel { NONE, MINIMAL, MILD, MODERATE, SEVERE, HIGH }
    let sanitizedRiskLevel:
      "NONE" | "MINIMAL" | "MILD" | "MODERATE" | "SEVERE" | "HIGH" = "NONE";
    const rawRisk = String(analysisData.riskLevel)
      .toUpperCase()
      .replace(/\s+|-/g, "_");

    if (["HIGH", "SEVERE"].includes(rawRisk) || rawRisk.includes("SEVERE")) {
      sanitizedRiskLevel = "SEVERE";
    } else if (rawRisk.includes("MODERATE")) {
      sanitizedRiskLevel = "MODERATE";
    } else if (rawRisk.includes("MILD")) {
      sanitizedRiskLevel = "MILD";
    } else if (rawRisk.includes("MINIMAL")) {
      sanitizedRiskLevel = "MINIMAL";
    } else if (rawRisk.includes("NONE")) {
      sanitizedRiskLevel = "NONE";
    } else {
      // Default fallback
      sanitizedRiskLevel = getRiskLevel(instrument, totalScore) as any;
    }

    // Save AI analysis
    await prisma.aIAnalysis.create({
      data: {
        screeningId,
        totalScore: analysisData.totalScore,
        confidence: analysisData.confidence,
        riskLevel: sanitizedRiskLevel,
        category: `${config.label} - ${analysisData.category}`,
        summary: analysisData.summary,
        reasoning: analysisData.reasoning,
        majorSymptoms: JSON.stringify(analysisData.majorSymptoms || []),
        minorSymptoms: JSON.stringify(analysisData.minorSymptoms || []),
        possibleCauses: JSON.stringify(analysisData.possibleCauses || []),
        recommendations: JSON.stringify(analysisData.recommendations || []),
        recommendedDiagnoses: JSON.stringify([]), // No diagnoses for single instrument
        emergencyFlags: JSON.stringify(analysisData.emergencyFlags || []),
      },
    });

    // Update screening status
    await prisma.screening.update({
      where: { id: screeningId },
      data: { status: "AI_ANALYZED" },
    });

    // Create notification for nurses
    const nurses = await prisma.user.findMany({
      where: { role: { in: ["NURSE", "ADMIN"] } },
    });

    await prisma.notification.createMany({
      data: nurses.map((nurse: { id: string }) => ({
        userId: nurse.id,
        title: "Skrining Baru Menunggu Validasi",
        message: `Hasil ${config.label} ${screening.patient.fullName} siap divalidasi`,
        type: "VALIDATION_PENDING",
      })),
    });

    revalidatePath("/screening");
    revalidatePath("/validation");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error analyzing screening:", error);
    return { error: "Gagal menganalisis skrining. Silakan coba lagi." };
  }
};
