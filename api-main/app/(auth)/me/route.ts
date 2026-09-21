import { NextResponse } from "next/server";

import {
  getCurrentUser,
  getCurrentWorkspace,
} from "@/lib/auth/dev-session";

export async function GET() {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  if (!user || !workspace) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      { status: 401 },
    );
  }

  const membership = user.workspaces.find(
    (member) => member.workspaceId === workspace.id,
  );

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    workspace: {
      id: workspace.id,
      name: workspace.name,
    },
    role: membership?.role ?? "AGENT",
  });
}