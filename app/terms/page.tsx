import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using ChineseNameAI.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl border border-black/10 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">ChineseNameAI</p>
      <h1 className="mt-2 text-4xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink/55">Last updated: June 28, 2026</p>
      <div className="mt-8 space-y-5 text-ink/75">
        <p>
          ChineseNameAI provides AI-assisted Chinese name suggestions and cultural explanations for informational and
          creative use.
        </p>
        <p>
          Generated names are suggestions, not legal, immigration, trademark, or professional advice. You are responsible
          for deciding whether a name is appropriate for your personal, business, or public use.
        </p>
        <p>
          You agree not to abuse the service, attempt to bypass usage limits, interfere with platform security, or submit
          unlawful content.
        </p>
        <p>
          Paid reports are delivered digitally after checkout and include expanded name ideas, explanations, style picks,
          and visual prompts as described on the pricing page.
        </p>
        <p>
          The service may change over time as models, providers, payment processors, or product features evolve.
        </p>
      </div>
    </article>
  );
}
