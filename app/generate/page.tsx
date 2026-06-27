import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GenerateForm } from "@/components/generate-form";
import { SetupRequired } from "@/components/setup-required";
import { createAdminClient, createClient, hasSupabaseAdminConfig } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Generate",
};

export default async function GeneratePage() {
  if (!hasSupabaseAdminConfig()) {
    return <SetupRequired service="Supabase" />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("is_paid").eq("id", user.id).single();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-cinnabar">Generate</p>
        <h1 className="mt-2 text-4xl font-semibold">Tell us who the name is for</h1>
      </div>
      <GenerateForm isPaid={Boolean(profile?.is_paid)} />
    </div>
  );
}
