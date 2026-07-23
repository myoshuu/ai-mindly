"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  fullName: z.string().min(1, "Nama lengkap diperlukan"),
  role: z.enum(["NURSE", "ADMIN"]),
  nip: z.string().optional(),
});

export const createUser = async (
  input: z.infer<typeof createUserSchema>
): Promise<{ error?: string; success?: boolean }> => {
  const validation = createUserSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "Validasi gagal" };
  }

  const { email, password, fullName, role, nip } = validation.data;

  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Email sudah terdaftar" };
    }

    // Hash password (simplified - in production use proper bcrypt)
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        nip: nip || null,
      },
    });

    revalidatePath("/users");
    return { success: true };

  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Gagal membuat pengguna. Silakan coba lagi." };
  }
};

export const getUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      nip: true,
      createdAt: true,
    },
  });
};

export const deleteUser = async (userId: string) => {
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Gagal menghapus pengguna" };
  }
};
