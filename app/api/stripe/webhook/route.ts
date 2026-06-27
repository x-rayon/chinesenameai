import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook error." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id || session.client_reference_id;
    if (userId) {
      const admin = createAdminClient();
      await admin
        .from("profiles")
        .upsert({
          id: userId,
          is_paid: true,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          paid_at: new Date().toISOString(),
        });
    }
  }

  return NextResponse.json({ received: true });
}
