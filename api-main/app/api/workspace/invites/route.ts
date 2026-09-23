import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth/dev-session";
import { sendInviteEmail } from "@/lib/email/resend";

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  role: z.enum(["ADMIN", "AGENT"]),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  if (!user || !workspace) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const membership = user.workspaces.find(
    (m) => m.workspaceId === workspace.id,
  );

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Only owners and admins can invite members." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid invite data." },
      { status: 400 },
    );
  }

  const { email, role } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: workspace.id,
      user: { email: normalizedEmail },
    },
  });

  if (existingMember) {
    return NextResponse.json(
      { error: "This person is already a member of the workspace." },
      { status: 409 },
    );
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const invite = await prisma.workspaceInvite.create({
    data: {
      workspaceId: workspace.id,
      email: normalizedEmail,
      role,
      token,
      expiresAt,
      invitedById: user.id,
    },
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${token}`;

  try {
    await sendInviteEmail({
      to: normalizedEmail,
      workspaceName: workspace.name,
      inviterName: user.name,
      inviteUrl,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
    // Don't fail the request — the invite exists and the link is returned below.
  }

  return NextResponse.json({
    ok: true,
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      inviteUrl,
    },
  });
}