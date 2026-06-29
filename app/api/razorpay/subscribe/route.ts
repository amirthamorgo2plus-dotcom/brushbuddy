// POST /api/razorpay/subscribe  { accountId, plan }
// Creates a Razorpay Subscription for the chosen plan and returns the id so the
// browser can open Razorpay Checkout. Requires env:
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
//   RAZORPAY_PLAN_STARTER, RAZORPAY_PLAN_PREMIUM  (Razorpay plan_ids)
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PLAN_TO_RZP: Record<string, string | undefined> = {
  starter: process.env.RAZORPAY_PLAN_STARTER,
  premium: process.env.RAZORPAY_PLAN_PREMIUM,
};

export async function POST(req: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
  }

  const { accountId, plan } = await req.json();
  const rzpPlanId = PLAN_TO_RZP[plan];
  if (!accountId || !rzpPlanId) {
    return NextResponse.json({ error: "Invalid plan or account" }, { status: 400 });
  }

  // Create the subscription via Razorpay REST (Basic auth, no SDK needed).
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const rzpRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: rzpPlanId,
      total_count: 12,                 // 12 monthly cycles
      customer_notify: 1,
      notes: { account_id: accountId, plan },
    }),
  });
  const sub = await rzpRes.json();
  if (!rzpRes.ok) {
    return NextResponse.json({ error: sub?.error?.description ?? "Razorpay error" }, { status: 502 });
  }

  // Record it as 'created'; the webhook flips it to active on payment.
  if (supabaseAdmin) {
    await supabaseAdmin.from("subscriptions").insert({
      account_id: accountId,
      plan,
      razorpay_subscription_id: sub.id,
      status: "created",
    });
  }

  return NextResponse.json({ subscriptionId: sub.id, keyId });
}
