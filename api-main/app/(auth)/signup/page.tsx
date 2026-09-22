"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const companyName = String(data.get("companyName") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          companyName,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to create your account.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111827]">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
        {/* Brand */}
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[-0.04em] text-[#111827]"
          >
            ACAPI
          </Link>
        </div>

        {/* Signup card */}
        <div className="w-full max-w-[460px] rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-[-0.025em]">
              Create your workspace
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              Get started with your ACAPI workspace.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                required
                className="h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              />
            </div>

            {/* Work email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                Work email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                className="h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              />
            </div>

            {/* Company */}
            <div>
              <label
                htmlFor="companyName"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                Company name
              </label>

              <input
                id="companyName"
                name="companyName"
                type="text"
                autoComplete="organization"
                placeholder="Your company"
                required
                className="h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                required
                className="h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirm"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                Confirm password
              </label>

              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                minLength={8}
                required
                className="h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating workspace…" : "Create account"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-7 border-t border-[#f0f0f0] pt-6 text-center">
            <p className="text-sm text-[#6b7280]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#111827] underline underline-offset-4 hover:text-[#4b5563]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-7 text-xs text-[#9ca3af]">
          © {new Date().getFullYear()} ACAPI
        </p>
      </div>
    </main>
  );
}

