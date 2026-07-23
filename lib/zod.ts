import { z } from "zod";

// Re-export z for convenience
export { z };

// Auth schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Nama pengguna / NIP wajib diisi"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().min(1, "Email / No. HP wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

// Patient schemas
export const patientSchema = z.object({
  nik: z.string().length(16, "NIK harus 16 digit angka"),
  fullName: z.string().min(2, "Nama lengkap pasien wajib diisi"),
  gender: z.enum(["MAN", "WOMAN"]),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  address: z.string().min(5, "Alamat lengkap wajib diisi"),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalHistory: z.string().optional(),
});

// Screening schemas
export const createScreeningSchema = z.object({
  patientId: z.string().min(1, "ID pasien diperlukan"),
  instrument: z.enum(["GAD7", "PHQ9", "SRQ20"], {
    message: "Jenis skrining diperlukan",
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

export const answerSchema = z.object({
  questionId: z.number().int().positive(),
  score: z.number().int().min(0).max(4),
});

export const validateScreeningSchema = z.object({
  screeningId: z.string().min(1, "ID skrining diperlukan"),
  nurseId: z.string().min(1, "ID perawat diperlukan"),
  decision: z.enum(["APPROVED", "REVISED", "REJECTED"]),
  notes: z.string().optional(),
  revisedRiskLevel: z.string().optional(),
  revisedCategory: z.string().optional(),
  revisedScore: z.number().optional(),
});

export const assignDiagnosisSchema = z.object({
  screeningId: z.string().min(1, "ID skrining diperlukan"),
  diagnosisIds: z.array(z.string()).min(1, "Minimal satu diagnosis diperlukan"),
  priorities: z.record(z.string(), z.number()).optional(),
  notes: z.record(z.string(), z.string()).optional(),
});

// AI Analysis schemas
export const analyzeScreeningSchema = z.object({
  screeningId: z.string().min(1, "ID skrining diperlukan"),
});
