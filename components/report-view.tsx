import { Check, LockKeyhole } from "lucide-react";
import { NameAudioButton } from "@/components/name-audio-button";
import type { NameIdea, NameReport } from "@/lib/types";

export function ReportView({ report }: { report: NameReport }) {
  const [recommended, ...alternatives] = report.names;
  if (!recommended) return null;

  return (
    <div className="space-y-8">
      <section className="border border-black/10 bg-white p-5 shadow-soft sm:p-7">
        <p className="text-sm uppercase tracking-wide text-cinnabar">Chinese Name Advisor</p>
        <h1 className="mt-2 text-3xl font-semibold">Your Chinese name report</h1>
        <p className="mt-2 text-ink/65">
          For {report.input.englishName} - {report.input.country} - {report.input.purpose}
        </p>
      </section>

      <RecommendedNameCard name={recommended} />

      {report.input.mode === "free" ? <UpgradeReportCard /> : null}

      {alternatives.length ? (
        <section>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">Recommended Alternatives</p>
              <h2 className="mt-1 text-2xl font-semibold">Carefully selected alternatives</h2>
              <p className="mt-2 max-w-2xl text-sm text-ink/60">
                These names were ranked as the strongest alternatives for your profile.
              </p>
            </div>
            <p className="text-sm text-ink/55">
              {report.input.mode === "paid" ? "9 carefully selected names" : "2 recommended alternatives"}
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {alternatives.map((name, index) => (
              <AlternativeNameCard key={`${name.chineseName}-${index}`} name={name} />
            ))}
          </div>
          {report.input.mode === "paid" ? <WhyOnlyTen /> : null}
        </section>
      ) : null}

      {report.stylePicks || report.prompts ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {report.stylePicks ? (
            <div className="border border-black/10 bg-white p-5">
              <h2 className="text-xl font-semibold">Style picks</h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <dt className="text-ink/55">Business</dt>
                <dd>{report.stylePicks.business}</dd>
                <dt className="text-ink/55">Literary</dt>
                <dd>{report.stylePicks.literary}</dd>
                <dt className="text-ink/55">Modern</dt>
                <dd>{report.stylePicks.modern}</dd>
                <dt className="text-ink/55">Classic</dt>
                <dd>{report.stylePicks.classic}</dd>
              </dl>
            </div>
          ) : null}
          {report.prompts ? (
            <div className="border border-black/10 bg-white p-5">
              <h2 className="text-xl font-semibold">Signature and seal prompts</h2>
              <p className="mt-4 text-sm text-ink/70">{report.prompts.signaturePrompt}</p>
              <p className="mt-3 text-sm text-ink/70">{report.prompts.sealPrompt}</p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function RecommendedNameCard({ name }: { name: NameIdea }) {
  const evaluation = getEvaluation(name);

  return (
    <section className="border border-black/10 bg-white p-6 shadow-soft sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">Recommended Name</p>
          <div className="mt-4 flex items-center gap-4">
            <h2 className="text-6xl font-semibold leading-none sm:text-7xl">{name.chineseName}</h2>
            <NameAudioButton name={name.chineseName} pinyin={name.pinyin} />
          </div>
          <p className="mt-3 text-xl text-ink/60">{name.pinyin}</p>
          <p className="mt-6 text-lg leading-relaxed text-ink/75">
            {evaluation.impressionSummary}
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreCard label="Naturalness" value={`${evaluation.naturalnessScore}/10`} />
            <ScoreCard label="Modernness" value={`${evaluation.modernnessScore}/10`} />
            <ScoreCard label="Pronunciation difficulty" value={evaluation.pronunciationDifficulty} />
            <FitScoreCard businessFit={evaluation.businessFit} personalFit={evaluation.personalFit} />
          </div>
          <div className="border border-black/10 bg-porcelain p-4">
            <p className="text-sm font-semibold">Native speaker impression</p>
            <p className="mt-2 text-ink/75">{evaluation.nativeImpression}</p>
          </div>
          <div className="border border-black/10 bg-porcelain p-4">
            <p className="text-sm font-semibold">Why this name fits you</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">{evaluation.whyItFits}</p>
          </div>
          <div className="border border-black/10 p-4">
            <p className="text-sm font-semibold">Risk warning</p>
            <p className="mt-2 text-sm text-ink/70">{evaluation.riskWarning}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AlternativeNameCard({ name }: { name: NameIdea }) {
  const evaluation = getEvaluation(name);

  return (
    <article className="border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-semibold">{name.chineseName}</h3>
            <NameAudioButton name={name.chineseName} pinyin={name.pinyin} />
          </div>
          <p className="mt-1 text-sm text-ink/55">{name.pinyin}</p>
        </div>
        <span className="bg-[#e8f3ef] px-2 py-1 text-xs capitalize text-jade">{name.style}</span>
      </div>

      <p className="mt-4 text-sm text-ink/75">{name.englishExplanation}</p>
      <p className="mt-3 text-sm text-ink/60">{name.culturalExplanation}</p>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <Metric label="Naturalness" value={`${evaluation.naturalnessScore}/10`} />
        <Metric label="Modernness" value={`${evaluation.modernnessScore}/10`} />
        <Metric label="Pronunciation" value={evaluation.pronunciationDifficulty} />
        <Metric label="Native impression" value={evaluation.nativeImpression} />
      </div>
      <p className="mt-3 text-xs text-ink/55">Risk warning: {evaluation.riskWarning}</p>
    </article>
  );
}

function UpgradeReportCard() {
  const items = [
    "See top 10 carefully selected Chinese names",
    "Get native-style evaluation",
    "Understand whether the name sounds natural, modern, and safe",
    "Get signature and Chinese seal prompts",
  ];

  return (
    <section className="border-2 border-cinnabar bg-white p-6 shadow-soft sm:p-7">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">Full Report</p>
          <h2 className="mt-2 text-3xl font-semibold">Unlock your complete Chinese Name Report</h2>
          <div className="mt-5 grid gap-2 text-sm text-ink/75 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <form action="/api/checkout" method="POST">
          <button className="inline-flex w-full items-center justify-center gap-2 bg-cinnabar px-6 py-3 font-medium text-white lg:w-auto">
            <LockKeyhole className="h-4 w-4" aria-hidden />
            Unlock for $4.99
          </button>
        </form>
      </div>
    </section>
  );
}

function WhyOnlyTen() {
  return (
    <div className="mt-5 border border-black/10 bg-white p-5">
      <p className="text-sm font-semibold">Why only 10?</p>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Instead of overwhelming you with dozens of random suggestions, we carefully rank and present the ten strongest
        Chinese names based on naturalness, personality fit, and real-world usability.
      </p>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function FitScoreCard({ businessFit, personalFit }: { businessFit: number; personalFit: number }) {
  return (
    <div className="border border-black/10 p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">Business / Personal fit</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-ink/50">Business</p>
          <p className="text-2xl font-semibold">{businessFit}/10</p>
        </div>
        <div>
          <p className="text-xs text-ink/50">Personal</p>
          <p className="text-2xl font-semibold">{personalFit}/10</p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-porcelain px-3 py-2">
      <span className="text-ink/50">{label}: </span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function getEvaluation(name: NameIdea) {
  return {
    impressionSummary:
      name.impressionSummary ||
      `This name gives the impression of someone ${name.englishExplanation.toLowerCase()}`,
    naturalnessScore: clampScore(name.naturalnessScore, 8),
    modernnessScore: clampScore(name.modernnessScore, name.style === "modern" ? 9 : 8),
    pronunciationDifficulty: name.pronunciationDifficulty || "Easy",
    businessFit: clampScore(name.businessFit, name.style === "business" ? 9 : 8),
    personalFit: clampScore(name.personalFit, 8),
    nativeImpression: name.nativeImpression || fallbackImpression(name.style),
    riskWarning: name.riskWarning || "Safe",
    whyItFits: name.whyItFits || name.chineseMeaning || name.culturalExplanation,
  };
}

function clampScore(value: number | undefined, fallback: number) {
  if (!value || Number.isNaN(value)) return fallback;
  return Math.max(1, Math.min(10, Math.round(value)));
}

function fallbackImpression(style: NameIdea["style"]) {
  if (style === "business") return "Professional";
  if (style === "literary") return "Literary";
  if (style === "modern") return "Modern";
  return "Elegant";
}
