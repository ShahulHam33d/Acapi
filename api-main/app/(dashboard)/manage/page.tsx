"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";

type Member = {
  userId: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "AGENT";
};

type Invite = {
  id: string;
  email: string;
  role: "OWNER" | "ADMIN" | "AGENT";
  expiresAt: string;
};

export default function ManagePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "AGENT">("AGENT");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/workspace/members", { cache: "no-store" });
    const data = await res.json();
    setMembers(data.members ?? []);
    setInvites(data.invites ?? []);
    setCurrentRole(data.currentRole ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLastInviteUrl(null);
    setSending(true);

    try {
      const res = await fetch("/api/workspace/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send invite.");
        return;
      }

      setLastInviteUrl(data.invite.inviteUrl);
      setEmail("");
      await load();
    } catch {
      setError("Failed to send invite.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-8">
      <PageHeader
        title="Manage"
        description="Manage your workspace members and roles."
      />

      {loading ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : (
        <>
          {canManage && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                Invite a member
              </h2>

              <form onSubmit={sendInvite} className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="teammate@company.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "ADMIN" | "AGENT")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="AGENT">Agent</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send Invite"}
                </button>
              </form>

              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}

              {lastInviteUrl && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="mb-1 text-slate-500">
                    Invite link (also emailed):
                  </div>
                  <code className="break-all text-indigo-700">
                    {lastInviteUrl}
                  </code>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              Members
            </h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.userId} className="border-b border-slate-50">
                    <td className="py-2">{m.name}</td>
                    <td className="py-2 text-slate-500">{m.email}</td>
                    <td className="py-2">{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canManage && invites.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                Pending Invites
              </h2>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((i) => (
                    <tr key={i.id} className="border-b border-slate-50">
                      <td className="py-2">{i.email}</td>
                      <td className="py-2">{i.role}</td>
                      <td className="py-2 text-slate-500">
                        {new Date(i.expiresAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}