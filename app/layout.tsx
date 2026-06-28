import type { Metadata } from "next";
import "./globals.css";
import { AuthHashHandler } from "@/components/auth-hash-handler";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "ChineseNameAI - AI Chinese Names for Foreigners",
    template: "%s | ChineseNameAI",
  },
  description:
    "Generate culturally natural Chinese names with pinyin, meanings, style guidance, signatures, and seal prompts.",
  keywords: ["Chinese name generator", "AI Chinese name", "Chinese names for foreigners", "pinyin", "Chinese naming"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChineseNameAI",
    description: "AI Chinese name reports for foreigners.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChineseNameAI",
    description: "Generate culturally natural Chinese names with pinyin and meanings.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthHashHandler />
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
