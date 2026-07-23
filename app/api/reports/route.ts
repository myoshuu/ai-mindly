import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "csv"; // "csv" or "print" (json)

    // Fetch screening records with patient information, AI risk levels, and validation decisions
    const screenings = await prisma.screening.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { fullName: true, nik: true, gender: true } },
        ai: { select: { totalScore: true, riskLevel: true, category: true, summary: true } },
        validation: { select: { decision: true, validatedAt: true, notes: true } },
      },
    });

    if (type === "print") {
      return NextResponse.json({ screenings });
    }

    // Generate CSV contents
    const headers = [
      "No",
      "ID Skrining",
      "Nama Pasien",
      "NIK",
      "Gender",
      "Tanggal Skrining",
      "Skor Total AI",
      "Tingkat Risiko",
      "Kategori",
      "Status Validasi",
      "Analisis Deskriptif (AI)",
      "Catatan Validasi (Perawat)",
    ];

    const csvRows = [headers.join(",")];

    screenings.forEach((s, idx) => {
      const row = [
        idx + 1,
        s.id,
        `"${s.patient.fullName.replace(/"/g, '""')}"`,
        `"${s.patient.nik}"`,
        s.patient.gender === "MAN" ? "Laki-laki" : "Perempuan",
        new Date(s.createdAt).toISOString().split("T")[0],
        s.ai?.totalScore ?? "-",
        s.ai?.riskLevel ?? "-",
        `"${(s.ai?.category || "-").replace(/"/g, '""')}"`,
        s.validation ? (s.validation.decision === "APPROVED" ? "Disetujui" : s.validation.decision === "REVISED" ? "Direvisi" : "Ditolak") : "Menunggu Validasi",
        `"${(s.ai?.summary || "-").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${(s.validation?.notes || "-").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Laporan-Rekapitulasi-Skrining.csv"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Gagal memproses data laporan" }, { status: 500 });
  }
}
