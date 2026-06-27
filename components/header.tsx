import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase-server";

export async function Header() {
  let user = null;

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-porcelain/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-cinnabar" aria-hidden />
          ChineseNameAI
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link className="hidden px-3 py-2 text-ink/70 hover:text-ink sm:inline" href="/pricing">
            Pricing
          </Link>
          <Link className="hidden px-3 py-2 text-ink/70 hover:text-ink sm:inline" href="/dashboard">
            History
          </Link>
          <Link
            className="inline-flex items-center gap-2 bg-ink px-3 py-2 text-white hover:bg-cinnabar"
            href={user ? "/generate" : "/login"}
          >
            <LogIn className="h-4 w-4" aria-hidden />
            {user ? "Generate" : "Sign in"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
