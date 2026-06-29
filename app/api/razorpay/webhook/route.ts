// POST /api/razorpay/webhook
// Razorpay calls this on subscription events. We verify the signature, then
// update accounts.plan + subscriptions. Handles upgrade / downgrade / cancel.
// Requires env: RAZORPAY_WEBHOOK_SECRET (+ service-role Supabase).
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !supabaseAdmin) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  const event = JSON.parse(raw);
  const sub = event?.payload?.subscription?.entity;
  const accountId = sub?.notes?.account_id as string | undefined;
  const plan = sub?.notes?.plan as string | undefined;
  const rzpSubId = sub?.id as string | undefined;

  // map event -> our subscription status + resulting account plan
  const type = event?.event as string;
  let subStatus: string | null = null;
  let accountPlan: string | null = null;
  let expires: string | null = null;

  switch (type) {
    case "subscription.activated":
    case "subscription.charged":
      subStatus = "active";
      accountPlan = plan ?? null;                 // UPGRADE
      if (sub?.current_end) expires = new Date(sub.current_end * 1000).toISOString();
      break;
    case "subscription.halted":
    case "subscription.pending":
      subStatus = "halted";
      break;
    case "subscription.cancelled":
    case "subscription.completed":
      subStatus = type === "subscription.cancelled" ? "cancelled" : "completed";
      accountPlan = "free";                        // DOWNGRADE (keep data, lock premium)
      break;
    default:
      return NextResponse.json({ ok: true, ignored: type });
  }

  if (rzpSubId && subStatus) {
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: subStatus, current_period_end: expires, updated_at: new Date().toISOString() })
      .eq("razorpay_subscription_id", rzpSubId);
  }

  if (accountId && accountPlan) {
    await supabaseAdmin
      .from("accounts")
      .update({ plan: accountPlan, plan_expires_at: expires })
      .eq("id", accountId);

    // emit a usage event for the Xeltrix Command dashboard (MRR / plan changes)
    await supabaseAdmin.from("usage_events").insert({
      account_id: accountId,
      event_type: "plan_change",
      meta: { to: accountPlan, via: type },
    }).then(() => {}, () => {}); // ignore if usage_events not yet created
  }

  return NextResponse.json({ ok: true });
}
