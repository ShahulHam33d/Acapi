"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Megaphone,
  CreditCard,
  BarChart3,
  Settings,
  Plug,
  Code2,
  LogOut,
} from "lucide-react";

const items = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Chats", "/chats", MessageSquare],
  ["Contacts", "/contacts", Users],
  ["AI Agents", "/ai-agents", Bot],
  ["Campaigns", "/campaigns", Megaphone],
  ["WA Payments", "/wa-payments", CreditCard],
  ["Ads Manager", "/ads-manager", BarChart3],
  ["Manage", "/manage", Settings],
  ["Integrations", "/integrations", Plug],
  ["Developer", "/developer", Code2],
] as const;

type CurrentUser = {
  name: string;
  email: string;
};

type CurrentWorkspace = {
  name: string;
};

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [workspace, setWorkspace] =
    useState<CurrentWorkspace | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        setUser(data.user);
        setWorkspace(data.workspace);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
    router.refresh();
  }

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur md:flex">
        <div className="mb-8 flex items-center gap-2 text-xl font-bold">
          <span className="rounded-lg bg-indigo-600 px-2 py-1 text-white">
            α
          </span>

          Alpha Connect
        </div>

        <nav className="space-y-1">
          {items.map(([label, href, Icon]) => (
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition duration-200 ease-out ${
                path === href
                  ? "bg-indigo-50 font-semibold text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
              }`}
              href={href}
              key={href}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="text-xs font-semibold tracking-wide text-slate-400">
            WORKSPACE
          </div>

          <div className="mt-2 font-medium text-slate-800">
            {loading
              ? "Loading workspace…"
              : workspace?.name ?? "Workspace"}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="truncate font-medium">
                {loading ? "Loading…" : user?.name ?? "User"}
              </div>

              {user?.email && (
                <div className="max-w-[125px] truncate text-xs text-slate-400">
                  {user.email}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="w-full">{children}</main>
    </div>
  );
}