import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "alpha_connect_session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export async function createSession(userId: string) {
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(
        Date.now() + SESSION_MAX_AGE * 1000,
      ),
    },
  });

  return session;
}

export function sessionCookie(sessionId: string) {
  return {
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function getSessionId() {
  return (
    (await cookies()).get(SESSION_COOKIE)?.value ?? null
  );
}

export async function getCurrentUser() {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: {
        include: {
          workspaces: {
            include: {
              workspace: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.user;
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();

  if (!user || user.workspaces.length === 0) {
    return null;
  }

  return user.workspaces[0].workspace;
}