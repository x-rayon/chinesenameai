import Link from "next/link";
import { ArrowRight, CheckCircle2, Languages, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { title: string; copy: string; Icon: LucideIcon }[] = [
  { title: "Free start", copy: "Generate 3 names per day before upgrading.", Icon: CheckCircle2 },
  { title: "Full report", copy: "Unlock 30 names plus cultural explanations and style picks.", Icon: ScrollText },
  { title: "Built for foreigners", copy: "Names are explained in English with pinyin and usage context.", Icon: Languages },
];

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="grid min-h-[70vh] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">AI Chinese naming studio</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
            Chinese names that sound natural, meaningful, and culturally right.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Enter your English name, background, personality, and purpose. Get Chinese names with pinyin, meaning,
            cultural context, and style guidance.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 bg-cinnabar px-5 py-3 font-medium text-white"
              href="/generate"
            >
              Generate names
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              className="inline-flex items-center justify-center border border-black/15 px-5 py-3 font-medium"
              href="/pricing"
            >
              View pricing
            </Link>
          </div>
        </div>
        <div className="border border-black/10 bg-white p-6 shadow-soft">
          <div className="border-b border-black/10 pb-4">
            <p className="text-sm text-ink/55">Sample result</p>
            <h2 className="mt-2 text-5xl font-semibold">林安然</h2>
            <p className="mt-2 text-ink/60">Lin Anran</p>
          </div>
          <div className="grid gap-4 py-5 text-sm text-ink/75">
            <p>An means peace; Ran suggests natural confidence and calm presence.</p>
            <p>Feels modern, educated, warm, and easy to introduce in both social and professional settings.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Business", "Modern", "Cultural"].map((item) => (
              <span key={item} className="border border-black/10 bg-porcelain px-3 py-2 text-center text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ title, copy, Icon }) => (
          <div key={title} className="border border-black/10 bg-white p-5">
            <Icon className="h-5 w-5 text-jade" aria-hidden />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-ink/65">{copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
