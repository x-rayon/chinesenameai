import type { Metadata } from "next";
import Link from "next/link";
import { Check, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free or unlock top 10 carefully selected Chinese names with native-style evaluation.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">Pricing</p>
      <h1 className="mt-2 text-4xl font-semibold">Choose a Chinese name with confidence.</h1>
      <p className="mt-3 max-w-2xl text-ink/65">
        Start with a free sample, then unlock 10 expert-selected Chinese names ranked by naturalness, suitability,
        cultural quality, and real-world usability.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Plan
          title="Free"
          price="$0"
          cta="Get my Chinese name"
          href="/generate"
          items={["3 Chinese name suggestions", "Pinyin", "Short meaning", "Basic cultural notes"]}
        />
        <form action="/api/checkout" method="POST" className="border-2 border-cinnabar bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Top 10 Carefully Selected Chinese Names</h2>
          <p className="mt-2 text-4xl font-semibold">$4.99</p>
          <p className="mt-3 text-sm text-ink/60">
            Quality over quantity. We rank a larger candidate set and show only the strongest names.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-ink/75">
            {[
              "Top 10 carefully selected Chinese names",
              "Ranked by naturalness and suitability",
              "Native-style evaluation",
              "Cultural meaning",
              "Personality matching",
              "Pronunciation guide",
              "Signature and seal prompts",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-jade" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <button className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-cinnabar px-5 py-3 font-medium text-white">
            <CreditCard className="h-4 w-4" aria-hidden />
            Unlock full report
          </button>
        </form>
      </div>
    </div>
  );
}

function Plan({ title, price, items, cta, href }: { title: string; price: string; items: string[]; cta: string; href: string }) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-4xl font-semibold">{price}</p>
      <ul className="mt-6 space-y-3 text-sm text-ink/75">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="h-4 w-4 shrink-0 text-jade" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <Link className="mt-6 inline-flex w-full items-center justify-center border border-black/15 px-5 py-3 font-medium" href={href}>
        {cta}
      </Link>
    </div>
  );
}
