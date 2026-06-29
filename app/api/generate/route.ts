import { NextResponse } from "next/server";
import { z } from "zod";
import { generateNameReport } from "@/lib/openai";
import { createAdminClient, createClient, hasSupabaseAdminConfig } from "@/lib/supabase-server";

const requestSchema = z.object({
  englishName: z.string().min(1).max(80),
  gender: z.enum(["male", "female", "neutral"]),
  country: z.string().min(1).max(80),
  personality: z.string().max(500).default(""),
  purpose: z.string().min(1).max(120),
  mode: z.enum(["free", "paid"]),
});

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const body = requestSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Please complete the form." }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin.from("profiles").upsert({ id: user.id, email: user.email });

  const { data: profile } = await admin.from("profiles").select("is_paid").eq("id", user.id).single();
  const mode = profile?.is_paid && body.data.mode === "paid" ? "paid" : "free";

  if (mode === "free") {
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await admin
      .from("name_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("mode", "free")
      .gte("created_at", `${today}T00:00:00.000Z`);

    if ((count || 0) >= 3) {
      return NextResponse.json({ error: "Daily free limit reached. Upgrade for the full report." }, { status: 429 });
    }
  }

  let report;
  try {
    report = await generateNameReport({ ...body.data, mode });
  } catch (error) {
    console.error("Name generation failed", error);
    return NextResponse.json({ error: "Name generation failed. Please try again in a moment." }, { status: 500 });
  }

  const { data, error } = await admin
    .from("name_reports")
    .insert({
      user_id: user.id,
      mode,
      input: report.input,
      report,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, mode });
}
