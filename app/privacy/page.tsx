import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ChineseNameAI handles account, payment, and name-generation data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 28, 2026">
      <p>
        ChineseNameAI collects the information needed to provide AI-generated Chinese name reports, including your email
        address, form inputs, generated reports, and payment status.
      </p>
      <p>
        Payments are processed by Stripe. ChineseNameAI does not store full card numbers or payment credentials. Login
        and account data are handled through Supabase.
      </p>
      <p>
        Your name-generation inputs may be sent to an AI provider to create your report. Do not submit sensitive personal
        information that is not needed for a naming report.
      </p>
      <p>
        We use your data to provide the service, prevent abuse, maintain purchase access, and improve reliability. We do
        not sell your personal data.
      </p>
      <p>
        To request deletion or support, contact the site owner using the email associated with your purchase or account.
      </p>
    </LegalPage>
  );
}

function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl border border-black/10 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">ChineseNameAI</p>
      <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-ink/55">Last updated: {updated}</p>
      <div className="mt-8 space-y-5 text-ink/75">{children}</div>
    </article>
  );
}
