import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund policy for ChineseNameAI digital reports.",
};

export default function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl border border-black/10 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">ChineseNameAI</p>
      <h1 className="mt-2 text-4xl font-semibold">Refund Policy</h1>
      <p className="mt-2 text-sm text-ink/55">Last updated: June 28, 2026</p>
      <div className="mt-8 space-y-5 text-ink/75">
        <p>
          ChineseNameAI sells digital reports that are generated and delivered immediately after payment. Because access
          is provided instantly, purchases are generally final.
        </p>
        <p>
          If a technical issue prevents report generation after payment, contact support with the email used at checkout.
          We will help restore access, regenerate the report, or review a refund request.
        </p>
        <p>
          Refund requests based on dissatisfaction with a generated name may be reviewed case by case, but are not
          guaranteed because the report is a custom digital output.
        </p>
        <p>Duplicate charges or accidental multiple purchases will be reviewed and refunded when verified.</p>
      </div>
    </article>
  );
}
