"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plan,
  PLAN_LABEL,
  PLAN_PRICE_MONTHLY,
  PLAN_LIMITS,
  LIMIT_LABEL,
  LimitKey,
  MODULES,
} from "@/lib/modules";
import { effectivePlan } from "@/lib/entitlements";
import { fetchAccountContext, AccountContext } from "@/lib/account";

const PLANS: Plan[] = ["free", "starter", "premium"];

export default function Upgrade() {
  const params = useSearchParams();
  const need = params.get("need") as Plan | null;
  const [ctx, setCtx] = useState<AccountContext | null>(null);
  const [busy, setBusy] = useState<Plan | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchAccountContext().then(setCtx); }, []);
  const current = ctx ? effectivePlan(ctx.entitlements) : "free";

  async function choose(plan: Plan) {
    if (plan === "free" || !ctx?.account.id) return;
    setBusy(plan);
    setMsg("");
    try {
      // Creates a Razorpay subscription server-side, then opens checkout.
      const res = await fetch("/api/razorpay/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: ctx.account.id, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");
      // @ts-ignore — Razorpay script injected in production
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        // eslint-disable-next-line new-cap
        new (window as any).Razorpay({
          key: data.keyId,
          subscription_id: data.subscriptionId,
          name: "BrushBuddy",
          description: `${PLAN_LABEL[plan]} plan`,
          handler: () => { window.location.href = "/settings/modules"; },
        }).open();
      } else {
        setMsg("Razorpay isn't configured yet. (Add keys + script to enable checkout.)");
      }
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(null);
    }
  }

  // modules unlocked per plan (for the comparison rows)
  const unlocks = (plan: Plan) => MODULES.filter((m) => m.minPlan === plan).map((m) => m.name);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-center text-4xl font-extrabold text-brand-ink">Choose your plan</h1>
      <p className="mt-2 text-center text-brand-ink/60">
        Upgrade anytime. Your data stays safe if you downgrade.
        {need && <span className="font-bold text-brand-coral"> That feature needs {PLAN_LABEL[need]}.</span>}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan === current;
          const featured = plan === "starter";
          return (
            <div
              key={plan}
              className={`flex flex-col rounded-xl2 border bg-white p-6 shadow-soft ${
                featured ? "border-brand-coral ring-2 ring-brand-coral/30" : "border-orange-100"
              }`}
            >
              {featured && (
                <span className="mb-2 self-start rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-brand-coral">
                  Most popular
                </span>
              )}
              <h2 className="text-2xl font-extrabold text-brand-ink">{PLAN_LABEL[plan]}</h2>
              <p className="mt-1 text-3xl font-extrabold text-brand-ink">
                {PLAN_PRICE_MONTHLY[plan] === 0 ? "Free" : `₹${PLAN_PRICE_MONTHLY[plan]}`}
                {PLAN_PRICE_MONTHLY[plan] !== 0 && <span className="text-base font-normal text-brand-ink/50">/mo</span>}
              </p>

              {/* limits */}
              <ul className="mt-4 space-y-1.5 text-sm text-brand-ink/70">
                {(Object.keys(PLAN_LIMITS[plan]) as LimitKey[]).map((k) => (
                  <li key={k}>
                    <span className="font-bold">{PLAN_LIMITS[plan][k] === -1 ? "Unlimited" : PLAN_LIMITS[plan][k]}</span>{" "}
                    {LIMIT_LABEL[k].toLowerCase()}
                  </li>
                ))}
              </ul>

              {/* what unlocks at this tier */}
              {unlocks(plan).length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-ink/40">Adds</p>
                  <ul className="mt-1 space-y-1 text-sm text-brand-ink/70">
                    {unlocks(plan).slice(0, 6).map((n) => (
                      <li key={n}>✓ {n}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                disabled={isCurrent || plan === "free" || busy === plan}
                onClick={() => choose(plan)}
                className={`mt-6 rounded-full px-5 py-3 font-bold transition disabled:opacity-60 ${
                  featured
                    ? "bg-gradient-to-r from-brand-coral to-brand-violet text-white shadow-glow hover:opacity-90"
                    : "border-2 border-brand-coral text-brand-coral hover:bg-orange-50"
                }`}
              >
                {isCurrent ? "Current plan" : plan === "free" ? "—" : busy === plan ? "Starting…" : `Get ${PLAN_LABEL[plan]}`}
              </button>
            </div>
          );
        })}
      </div>

      {msg && <p className="mt-6 text-center text-sm text-amber-600">{msg}</p>}
    </div>
  );
}
