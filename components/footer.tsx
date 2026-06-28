import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
        <p>(c) {new Date().getFullYear()} ChineseNameAI</p>
        <nav className="flex flex-wrap gap-4">
          <Link className="hover:text-ink" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-ink" href="/terms">
            Terms
          </Link>
          <Link className="hover:text-ink" href="/refund">
            Refunds
          </Link>
        </nav>
      </div>
    </footer>
  );
}
