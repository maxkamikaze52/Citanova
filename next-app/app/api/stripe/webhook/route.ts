import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { admin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function idOf(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** Which practice does this checkout belong to? Prefer an explicit business_id in
 *  the session metadata; otherwise the owner's practice via business_members. */
async function resolveBusinessId(meta: Stripe.Metadata | null): Promise<string | null> {
  if (meta?.business_id) return meta.business_id;
  if (!meta?.user_id) return null;
  const { data } = await admin
    .from("business_members")
    .select("business_id")
    .eq("user_id", meta.user_id)
    .eq("role", "owner")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data?.business_id as string | undefined) ?? null;
}

async function sendWelcome(to: string | null | undefined) {
  if (!to || !process.env.RESEND_API_KEY) return;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `YourAI <hello@${process.env.NEXT_PUBLIC_ROOT_DOMAIN}>`,
      to,
      subject: "Your AI assistant is ready",
      html: `<p>Welcome! Open your dashboard: https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/dashboard</p>`,
    });
  } catch (error) {
    console.error("[stripe] welcome email failed", error);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("missing signature");
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse("bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const businessId = await resolveBusinessId(s.metadata);
    if (!businessId) {
      // 500 on purpose: Stripe retries, which covers a practice that is created
      // a moment after the payment. It also shows up in the Stripe dashboard.
      console.error("[stripe] checkout completed but no practice found", s.id);
      return NextResponse.json({ error: "no_practice" }, { status: 500 });
    }

    const { data: before } = await admin
      .from("businesses")
      .select("subscription_status")
      .eq("id", businessId)
      .maybeSingle();

    const paid = s.payment_status === "paid" || s.payment_status === "no_payment_required";
    const { error } = await admin
      .from("businesses")
      .update({
        stripe_customer_id: idOf(s.customer),
        stripe_subscription_id: idOf(s.subscription),
        subscription_status: paid ? "active" : "incomplete",
      })
      .eq("id", businessId);
    if (error) {
      console.error("[stripe] could not update practice", businessId, error.message);
      return NextResponse.json({ error: "db_update_failed" }, { status: 500 });
    }

    if (paid && before?.subscription_status !== "active") {
      await sendWelcome(s.customer_details?.email);
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = idOf(sub.customer);
    if (customerId) {
      const { error } = await admin
        .from("businesses")
        .update({ subscription_status: sub.status, stripe_subscription_id: sub.id })
        .eq("stripe_customer_id", customerId);
      if (error) {
        console.error("[stripe] could not update subscription status", error.message);
        return NextResponse.json({ error: "db_update_failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
