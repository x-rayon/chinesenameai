import type { Metadata } from "next";
import Link from "next/link";
import { Check, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free or unlock a complete Chinese name report with 30 names, pinyin, meanings, and cultural context.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">Pricing</p>
      <h1 className="mt-2 text-4xl font-semibold">Start free. Unlock the complete report for $4.99.</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Plan title="Free" price="$0" cta="Generate free names" href="/generate" items={["3 Chinese names", "Pinyin", "Short meanings", "3 generations per day"]} />
        <form action="/api/checkout" method="POST" className="border-2 border-cinnabar bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Full report</h2>
          <p className="mt-2 text-4xl font-semibold">$4.99</p>
          <ul className="mt-6 space-y-3 text-sm text-ink/75">
            {["30 Chinese names", "Pinyin and English explanations", "Chinese meanings and cultural context", "Business, literary, modern, classic styles", "Signature and seal prompts"].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-jade" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <button className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-cinnabar px-5 py-3 font-medium text-white">
            <CreditCard className="h-4 w-4" aria-hidden />
            Pay once
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
