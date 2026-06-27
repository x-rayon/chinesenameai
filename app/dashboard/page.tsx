import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupRequired } from "@/components/setup-required";
import { createAdminClient, createClient, hasSupabaseAdminConfig } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  if (!hasSupabaseAdminConfig()) {
    return <SetupRequired service="Supabase" />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("name_reports")
    .select("id, mode, input, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">History</p>
          <h1 className="mt-2 text-4xl font-semibold">Your generated reports</h1>
        </div>
        <Link className="bg-ink px-4 py-3 text-center text-white" href="/generate">
          New report
        </Link>
      </div>

      <div className="mt-8 grid gap-3">
        {reports?.length ? (
          reports.map((report) => {
            const input = report.input as { englishName?: string; purpose?: string; country?: string };
            return (
              <Link key={report.id} className="border border-black/10 bg-white p-4 hover:border-cinnabar" href={`/result?id=${report.id}`}>
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-semibold">{input.englishName || "Untitled report"}</h2>
                    <p className="mt-1 text-sm text-ink/60">
                      {input.country} · {input.purpose}
                    </p>
                  </div>
                  <div className="text-sm text-ink/55">
                    {report.mode} · {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="border border-black/10 bg-white p-8 text-center">
            <p className="text-ink/65">No reports yet.</p>
            <Link className="mt-4 inline-flex bg-cinnabar px-4 py-3 text-white" href="/generate">
              Generate your first names
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
