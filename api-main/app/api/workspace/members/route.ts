import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth/dev-session";

export async function GET() {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  if (!user || !workspace) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const membership = user.workspaces.find(
    (m) => m.workspaceId === workspace.id,
  );

  const [members, invites] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
      orderBy: { user: { createdAt: "asc" } },
    }),
    prisma.workspaceInvite.findMany({
      where: { workspaceId: workspace.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    currentRole: membership?.role ?? null,
    members: members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    })),
    invites: invites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt,
    })),
  });
}