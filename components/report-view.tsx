import { NameAudioButton } from "@/components/name-audio-button";
import type { NameReport } from "@/lib/types";

export function ReportView({ report }: { report: NameReport }) {
  return (
    <div className="space-y-6">
      <section className="border border-black/10 bg-white p-5 shadow-soft">
        <p className="text-sm uppercase tracking-wide text-cinnabar">Chinese name report</p>
        <h1 className="mt-2 text-3xl font-semibold">For {report.input.englishName}</h1>
        <p className="mt-2 text-ink/65">
          {report.input.country} - {report.input.gender} - {report.input.purpose}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {report.names.map((name, index) => (
          <article key={`${name.chineseName}-${index}`} className="border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-semibold">{name.chineseName}</h2>
                  <NameAudioButton name={name.chineseName} pinyin={name.pinyin} />
                </div>
                <p className="mt-1 text-sm text-ink/55">{name.pinyin}</p>
              </div>
              <span className="bg-[#e8f3ef] px-2 py-1 text-xs capitalize text-jade">{name.style}</span>
            </div>
            <p className="mt-4 text-sm text-ink/75">{name.englishExplanation}</p>
            <p className="mt-3 text-sm text-ink/75">{name.chineseMeaning}</p>
            <p className="mt-3 text-sm text-ink/60">{name.culturalExplanation}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {name.suitableScenarios.map((scenario) => (
                <span key={scenario} className="border border-black/10 px-2 py-1 text-xs text-ink/65">
                  {scenario}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

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
              <h2 className="text-xl font-semibold">Visual prompts</h2>
              <p className="mt-4 text-sm text-ink/70">{report.prompts.signaturePrompt}</p>
              <p className="mt-3 text-sm text-ink/70">{report.prompts.sealPrompt}</p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
