import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { nik, fullName, gender, birthDate, phone, address, emergencyContact, emergencyPhone, medicalHistory } = body;

    // Validation
    if (!nik || nik.length !== 16) {
      return NextResponse.json(
        { error: "NIK harus 16 digit" },
        { status: 400 }
      );
    }

    if (!fullName || !gender || !birthDate || !phone || !address) {
      return NextResponse.json(
        { error: "Semua field wajib harus diisi" },
        { status: 400 }
      );
    }

    // Check if NIK already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { nik },
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: "NIK sudah terdaftar dalam sistem" },
        { status: 400 }
      );
    }

    // Create user first (for authentication)
    const tempEmail = `patient-${nik}@mindly.local`;
    const hashedPassword = await bcrypt.hash(nik.slice(-6), 10);

    const user = await prisma.user.create({
      data: {
        email: tempEmail,
        password: hashedPassword,
        fullName,
        role: "PATIENT",
        patients: {
          create: {
            nik,
            fullName,
            gender,
            birthDate: new Date(birthDate),
            phone,
            address,
            emergencyContact: emergencyContact || null,
            emergencyPhone: emergencyPhone || null,
            medicalHistory: medicalHistory || null,
          },
        },
      },
      include: {
        patients: true,
      },
    });

    return NextResponse.json({
      success: true,
      patientId: user.patients?.[0]?.id,
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data pasien. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        screenings: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            ai: { select: { riskLevel: true } },
          },
        },
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pasien" },
      { status: 500 }
    );
  }
}
