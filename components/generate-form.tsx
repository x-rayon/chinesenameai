"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import type { Gender } from "@/lib/types";

export function GenerateForm({ isPaid }: { isPaid: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    englishName: "",
    gender: "neutral" as Gender,
    country: "",
    personality: "",
    purpose: "",
    mode: isPaid ? "paid" : "free",
  });

  async function submit() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, mode: isPaid ? "paid" : "free" }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Generation failed.");
      return;
    }
    router.push(`/result?id=${data.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="border border-black/10 bg-white p-5 shadow-soft sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="English name">
            <input className="input" value={form.englishName} onChange={(e) => setForm({ ...form, englishName: e.target.value })} />
          </Field>
          <Field label="Gender">
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
              <option value="neutral">Neutral</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Country">
            <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </Field>
          <Field label="Purpose">
            <select className="input" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
              <option value="">Choose one</option>
              <option>Business</option>
              <option>Study in China</option>
              <option>Social media</option>
              <option>Travel</option>
              <option>Artistic identity</option>
            </select>
          </Field>
          <Field label="Personality">
            <textarea
              className="input min-h-32 sm:col-span-2"
              value={form.personality}
              onChange={(e) => setForm({ ...form, personality: e.target.value })}
              placeholder="Warm, ambitious, creative, calm..."
            />
          </Field>
        </div>
        <button
          onClick={submit}
          disabled={loading || !form.englishName || !form.country || !form.purpose}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-cinnabar px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-ink/30 sm:w-auto"
        >
          <Wand2 className="h-4 w-4" aria-hidden />
          {loading ? "Generating..." : isPaid ? "Generate full report" : "Generate 3 names"}
        </button>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
      <aside className="border border-black/10 bg-[#e8f3ef] p-5">
        <h2 className="font-semibold">{isPaid ? "Full report unlocked" : "Free plan"}</h2>
        <p className="mt-2 text-sm text-ink/70">
          {isPaid
            ? "Your paid report includes 30 names, cultural analysis, style picks, signature prompts, and seal prompts."
            : "Free users can generate 3 names per day. Upgrade for a complete 30-name cultural report."}
        </p>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
