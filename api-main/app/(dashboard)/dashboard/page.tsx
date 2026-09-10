"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import {
  MessageSquare,
  Users,
  Inbox,
  CheckCircle2,
} from "lucide-react";

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        autoLogAppEvents: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { code: string };
        }) => void,
        options: {
          config_id: string;
          response_type: string;
          override_default_response_type: boolean;
          extras: { setup: Record<string, unknown> };
        }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function Dashboard() {
  const [configured] = useState(
    Boolean(
      process.env.NEXT_PUBLIC_META_APP_ID &&
        process.env.NEXT_PUBLIC_META_CONFIG_ID
    )
  );

  const [sdkReady, setSdkReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [stats, setStats] = useState({
    contacts: 0,
    active: 0,
    messages: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts"),
      fetch("/api/conversations"),
    ])
      .then(async ([a, b]) => {
        const c = await a.json();
        const v = await b.json();

        setStats({
          contacts: c.contacts.length,
          active: v.conversations.filter(
            (x: { status: string }) => x.status === "ACTIVE"
          ).length,
          messages: v.conversations.reduce(
            (n: number, x: { messages: { direction: string }[] }) =>
              n + x.messages.filter((m) => m.direction === "INBOUND").length,
            0
          ),
        });
      })
      .catch(() => {});
  }, []);

  // Load Meta SDK
  useEffect(() => {
    if (window.FB) {
      setSdkReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID!,
        autoLogAppEvents: true,
        xfbml: true,
        version: process.env.NEXT_PUBLIC_META_GRAPH_API_VERSION!,
      });

      setSdkReady(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  // Receive Embedded Signup events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;

      try {
        const data = JSON.parse(event.data);

        if (data.type === "WA_EMBEDDED_SIGNUP") {
          console.log("Embedded Signup event:", data);

          if (data.event === "FINISH") {
            setNotice("WhatsApp onboarding completed. Processing...");
          } else if (data.event === "CANCEL") {
            setNotice("WhatsApp onboarding was cancelled.");
          } else if (data.event === "ERROR") {
            setNotice("Meta reported an onboarding error.");
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const launchWhatsAppSignup = () => {
    if (!configured) {
      setNotice(
        "Meta Embedded Signup is not configured. Add your Meta App ID and Configuration ID."
      );
      return;
    }

    if (!sdkReady || !window.FB) {
      setNotice("Meta SDK is still loading. Please try again.");
      return;
    }

    setNotice("Opening Meta Embedded Signup...");

    window.FB.login(
      async (response) => {
        console.log("Meta login response:", response);

        const code = response.authResponse?.code;

        if (!code) {
          setNotice("WhatsApp onboarding was cancelled or no code was returned.");
          return;
        }

        console.log("Authorization code received:", code);

        setNotice("Connecting WhatsApp to Alpha Connect...");

        try {
          const result = await fetch("/api/whatsapp/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          const data = await result.json();

          console.log("Backend signup response:", data);

          if (!result.ok) {
            throw new Error(
              data.error || "WhatsApp connection failed."
            );
          }

          setNotice("WhatsApp authorization successful!");
        } catch (error) {
          console.error("Backend exchange error:", error);

          setNotice(
            error instanceof Error
              ? error.message
              : "WhatsApp connection failed."
          );
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID!,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
        },
      }
    );
  };

  const cards: [string, string, React.ElementType][] = [
    ["Total Contacts", String(stats.contacts), Users],
    ["Active Conversations", String(stats.active), MessageSquare],
    ["Inbound Messages", String(stats.messages), Inbox],
    ["Connection Status", "Not connected", CheckCircle2],
  ];

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title="Dashboard"
        description="A clear view of your customer conversations and workspace health."
      />

      <div className="mb-6 rounded-2xl border border-white/40 bg-indigo-50/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 font-semibold text-indigo-950">
              <span className="rounded-full bg-white p-2">
                <MessageSquare size={18} />
              </span>
              Connect your WhatsApp Business Account
            </div>

            <p className="max-w-xl text-sm text-indigo-900/70">
              Alpha Connect needs an official Meta WhatsApp Business Platform
              connection before messages can be received and managed.
            </p>
          </div>

          <button
            onClick={launchWhatsAppSignup}
            disabled={!configured || !sdkReady}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sdkReady ? "Connect WhatsApp Business" : "Loading Meta..."}
          </button>
        </div>

        <p className="mt-4 text-xs text-indigo-800">
          {notice ||
            (configured
              ? "Meta Embedded Signup is ready to launch."
              : "Meta Embedded Signup is not configured. Add your Meta App ID and Configuration ID to enable it.")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div
            className="rounded-xl border border-white/40 bg-white/75 p-5 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            key={label}
          >
            <Icon size={19} className="text-slate-400" />
            <div className="mt-5 text-sm text-slate-500">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Your workspace is ready</h2>
        <p className="mt-2 text-sm text-slate-500">
          Connect WhatsApp to start receiving conversations. You can manage
          contacts and prepare your inbox while your account is being configured.
        </p>
      </div>
    </div>
  );
}