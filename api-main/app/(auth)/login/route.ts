import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { sessionCookie } from "@/lib/auth/dev-session";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid login data.",
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 30,
        ),
      },
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set(sessionCookie(session.id));

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Unable to sign in.",
      },
      { status: 500 },
    );
  }
}