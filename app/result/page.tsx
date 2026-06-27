import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReportView } from "@/components/report-view";
import { SetupRequired } from "@/components/setup-required";
import { createAdminClient, createClient, hasSupabaseAdminConfig } from "@/lib/supabase-server";
import type { NameReport } from "@/lib/types";

export const metadata: Metadata = {
  title: "Result",
};

export default async function ResultPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  if (!hasSupabaseAdminConfig()) {
    return <SetupRequired service="Supabase" />;
  }

  const { id } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!id) redirect("/dashboard");

  const admin = createAdminClient();
  const { data } = await admin
    .from("name_reports")
    .select("id, report")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <Link className="text-sm text-cinnabar" href="/dashboard">
        Back to history
      </Link>
      <ReportView report={data.report as NameReport} />
    </div>
  );
}
