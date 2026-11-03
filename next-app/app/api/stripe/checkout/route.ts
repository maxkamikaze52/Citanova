import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getMyBusiness } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { plan } = await req.json().catch(() => ({}));
  const jar = await cookies();
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => jar.getAll(), setAll: () => {} } });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });

  const { business } = await getMyBusiness();
  if (!business) {
    return NextResponse.json({ error: "Finish setting up your practice first." }, { status: 409 });
  }
  if (["active", "trialing", "past_due"].includes(business.subscription_status)) {
    return NextResponse.json({ error: "This practice already has a subscription." }, { status: 409 });
  }

  const price = plan === "pro" ? process.env.STRIPE_PRICE_PRO! : process.env.STRIPE_PRICE_STARTER!;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email!,
    line_items: [{ price, quantity: 1 }],
    metadata: { user_id: user.id, business_id: business.id },
    success_url: `https://app.${root}/dashboard?welcome=1`,
    cancel_url: `https://${root}/pricing`,
  });
  return NextResponse.json({ url: session.url });
}
