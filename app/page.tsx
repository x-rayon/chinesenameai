import Link from "next/link";
import { ArrowRight, CheckCircle2, Languages, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { title: string; copy: string; Icon: LucideIcon }[] = [
  { title: "Native-style advice", copy: "Evaluate whether a name sounds natural, modern, and safe.", Icon: CheckCircle2 },
  { title: "Complete report", copy: "Unlock 30 personalized names with scoring, context, and style guidance.", Icon: ScrollText },
  { title: "Pronunciation ready", copy: "Every name includes pinyin, meaning, and a Chinese pronunciation button.", Icon: Languages },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid min-h-[62vh] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">Chinese Name Advisor</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
            Get a real Chinese name that native speakers would actually use.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Generate a natural, meaningful Chinese name with pronunciation, cultural context, and native-style
            evaluation - not a random translation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 bg-cinnabar px-5 py-3 font-medium text-white"
              href="/generate"
            >
              Get my Chinese name
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
        <div className="border border-black/10 bg-white p-6 shadow-soft lg:mt-6">
          <div className="border-b border-black/10 pb-4">
            <p className="text-sm text-ink/55">Recommended Name</p>
            <h2 className="mt-2 text-5xl font-semibold">林安然</h2>
            <p className="mt-2 text-ink/60">Lin Anran</p>
          </div>
          <div className="grid gap-3 py-5 text-sm text-ink/75">
            <p>This name gives the impression of calm confidence, warmth, and quiet intelligence.</p>
            <div className="grid grid-cols-2 gap-2">
              <span className="border border-black/10 bg-porcelain px-3 py-2">Naturalness: 9/10</span>
              <span className="border border-black/10 bg-porcelain px-3 py-2">Modernness: 8/10</span>
              <span className="border border-black/10 bg-porcelain px-3 py-2">Pronunciation: Easy</span>
              <span className="border border-black/10 bg-porcelain px-3 py-2">Risk: Safe</span>
            </div>
            <p>Feels native, educated, and easy to introduce in both social and professional settings.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Professional", "Modern", "Natural"].map((item) => (
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
