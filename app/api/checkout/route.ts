import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createAdminClient, createClient, hasSupabaseAdminConfig } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  await admin.from("profiles").upsert({ id: user.id, email: user.email });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_creation: "always",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: user.email || undefined,
    client_reference_id: user.id,
    success_url: `${siteUrl}/generate?paid=success`,
    cancel_url: `${siteUrl}/pricing?paid=cancelled`,
    metadata: { user_id: user.id },
  });

  redirect(session.url || "/pricing");
}
