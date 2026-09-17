import { NextResponse } from "next/server";
import { getEmbeddedSignupConfig } from "@/services/meta.service";

export async function GET() {
  const config = getEmbeddedSignupConfig();

  if (!config.configured) {
    return NextResponse.json(config, { status: 503 });
  }

  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body?.code;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Authorization code is required.",
        },
        { status: 400 }
      );
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    const apiVersion =
      process.env.META_GRAPH_API_VERSION ||
      process.env.NEXT_PUBLIC_META_GRAPH_API_VERSION ||
      "v23.0";

    if (!appId || !appSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Meta server credentials are not configured.",
        },
        { status: 500 }
      );
    }

    // This must exactly match the redirect URI configured
    // in Meta Developer Dashboard.
    const redirectUri = "https://acapi-seven.vercel.app/";

    const tokenUrl =
      `https://graph.facebook.com/${apiVersion}/oauth/access_token` +
      `?client_id=${encodeURIComponent(appId)}` +
      `&client_secret=${encodeURIComponent(appSecret)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${encodeURIComponent(code)}`;

    console.log("Exchanging Meta authorization code...");
    console.log("Meta API version:", apiVersion);
    console.log("Meta redirect URI:", redirectUri);

    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      cache: "no-store",
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Meta token exchange failed:", tokenData);

      return NextResponse.json(
        {
          success: false,
          error: "Meta authorization code exchange failed.",
          details: tokenData,
        },
        { status: tokenResponse.status }
      );
    }

    console.log("Meta token exchange successful.");

    return NextResponse.json({
      success: true,
      message: "Authorization code exchanged successfully.",
      accessTokenReceived: Boolean(tokenData.access_token),
    });
  } catch (error) {
    console.error("WhatsApp signup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process WhatsApp signup.",
      },
      { status: 500 }
    );
  }
}