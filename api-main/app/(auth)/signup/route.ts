import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession, sessionCookie } from "@/lib/auth/dev-session";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid work email."),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid signup data.",
        },
        { status: 400 },
      );
    }

    const { name, email, companyName, password } = parsed.data;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: companyName,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });

      const session = await tx.session.create({
        data: {
          userId: user.id,
          expiresAt: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 30,
          ),
        },
      });

      return {
        user,
        workspace,
        session,
      };
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
      },
    });

    response.cookies.set(sessionCookie(result.session.id));

    return response;
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        error: "Unable to create your account.",
      },
      { status: 500 },
    );
  }
}