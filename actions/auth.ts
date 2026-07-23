"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_EXPIRY_DAYS = 7;

export const loginAction = async (formData: FormData): Promise<{ error?: string }> => {
  const rawInput = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = loginSchema.safeParse(rawInput);
  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "Validasi gagal" };
  }

  const { email, password } = validation.data;

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { nip: email }] },
    });

    if (!user) {
      return { error: "Nama pengguna / NIP tidak terdaftar" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: "Kata sandi salah" };
    }

    if (!user.isActive) {
      return { error: "Akun tidak aktif" };
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
      path: "/",
    });
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan, coba lagi" };
  }

  revalidatePath("/");
  redirect("/");
};

export const logoutAction = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
};
