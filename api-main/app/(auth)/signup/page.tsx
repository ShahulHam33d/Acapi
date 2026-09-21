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
    <main>
      <h1>Create your workspace</h1>

      <p>Set up your Alpha Connect account.</p>

      <form onSubmit={submit}>
        <label>
          Full name
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </label>

        <label>
          Work email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Company name
          <input
            name="companyName"
            type="text"
            autoComplete="organization"
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label>
          Confirm password
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating workspace…" : "Create account"}
        </button>
      </form>

      <Link href="/login">Already have an account? Sign in</Link>
    </main>
  );
}