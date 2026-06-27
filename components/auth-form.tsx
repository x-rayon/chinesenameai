"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

export function AuthForm({ isConfigured = true }: { isConfigured?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function signIn() {
    if (!isConfigured) {
      setStatus("Supabase is not configured. Add .env.local values and restart the server.");
      return;
    }

    setStatus("Sending magic link...");
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    setStatus(error ? error.message : "Check your email for the login link.");
  }

  return (
    <div className="mx-auto max-w-md border border-black/10 bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-ink/65">Use a magic link to save your reports and unlock paid results.</p>
      <label className="mt-6 block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        className="mt-2 w-full border border-black/15 px-3 py-3 outline-none focus:border-jade"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        disabled={!isConfigured}
      />
      <button
        onClick={signIn}
        disabled={!email || !isConfigured}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 text-white disabled:cursor-not-allowed disabled:bg-ink/35"
      >
        <Mail className="h-4 w-4" aria-hidden />
        Send magic link
      </button>
      {status ? <p className="mt-4 text-sm text-ink/70">{status}</p> : null}
    </div>
  );
}
