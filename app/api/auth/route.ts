import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { loginSchema, registerSchema } from "@/lib/zod";
import { z } from "zod";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_EXPIRY_DAYS = 7;

// Simple session-based auth - store user ID directly as session value
const createSession = async (userId: string): Promise<string> => {
  // Session value is the user ID itself for simplicity
  return userId;
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, password, action, fullName, role } = body;

    if (action === "sign-in") {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { nip: email },
          ],
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Nama pengguna / NIP tidak terdaftar" },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Kata sandi salah" },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { error: "Akun tidak aktif" },
          { status: 401 }
        );
      }

      const sessionId = await createSession(user.id);
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json({
        session: { id: sessionId },
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        },
      });
    }

    if (action === "register") {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email sudah terdaftar" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName: fullName || email.split("@")[0],
          role: role || "PATIENT",
          patients: role === "PATIENT" ? {
            create: {
              nik: `AUTO-${Date.now()}`,
              fullName: fullName || email.split("@")[0],
              gender: "MAN",
              birthDate: new Date("1990-01-01"),
              phone: "-",
              address: "-",
            },
          } : undefined,
        },
      });

      return NextResponse.json({ success: true, userId: user.id });
    }

    if (action === "sign-out") {
      const cookieStore = await cookies();
      cookieStore.delete(SESSION_COOKIE_NAME);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionId || !sessionId.value) {
      return NextResponse.json({ session: null });
    }

    // Validate session - the session value is the user ID directly
    const userId = sessionId.value;
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      // Clear invalid session
      cookieStore.delete(SESSION_COOKIE_NAME);
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({
      session: { id: sessionId.value },
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ session: null });
  }
};
