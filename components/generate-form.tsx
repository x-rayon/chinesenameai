"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import type { Gender } from "@/lib/types";

export function GenerateForm({ isPaid }: { isPaid: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generationMode, setGenerationMode] = useState<"free" | "paid">(isPaid ? "paid" : "free");
  const [form, setForm] = useState({
    englishName: "",
    gender: "neutral" as Gender,
    country: "",
    personality: "",
    purpose: "",
  });

  async function submit() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, mode: generationMode }),
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
        {isPaid ? (
          <div className="mb-5 grid gap-2 border border-black/10 bg-porcelain p-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setGenerationMode("paid")}
              className={`px-4 py-3 text-left text-sm font-medium ${
                generationMode === "paid" ? "bg-ink text-white" : "bg-white text-ink hover:border-cinnabar"
              }`}
              disabled={loading}
            >
              Full report
              <span className="mt-1 block text-xs font-normal opacity-75">30 names plus cultural report</span>
            </button>
            <button
              type="button"
              onClick={() => setGenerationMode("free")}
              className={`px-4 py-3 text-left text-sm font-medium ${
                generationMode === "free" ? "bg-ink text-white" : "bg-white text-ink hover:border-cinnabar"
              }`}
              disabled={loading}
            >
              Quick sample
              <span className="mt-1 block text-xs font-normal opacity-75">3 names for a fast preview</span>
            </button>
          </div>
        ) : null}
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
          {loading
            ? "Creating your report..."
            : generationMode === "paid"
              ? "Generate full report"
              : "Generate 3 names"}
        </button>
        {loading ? (
          <p className="mt-4 max-w-xl text-sm text-ink/60" aria-live="polite">
            {generationMode === "paid"
              ? "Creating a complete 30-name cultural report. This can take 20-60 seconds."
              : "Creating 3 Chinese name ideas. This usually takes a few seconds."}
          </p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
      <aside className="border border-black/10 bg-[#e8f3ef] p-5">
        <h2 className="font-semibold">
          {isPaid && generationMode === "paid" ? "Full report unlocked" : isPaid ? "Quick sample" : "Free plan"}
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          {isPaid && generationMode === "paid"
            ? "Your paid report includes 30 names, cultural analysis, style picks, signature prompts, and seal prompts."
            : isPaid
              ? "Quick sample mode creates 3 names when you want a faster preview."
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
