"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MODULES,
  ModuleCategory,
  PLAN_LABEL,
  PLAN_LIMITS,
  LIMIT_LABEL,
  LimitKey,
  AppModule,
} from "@/lib/modules";
import { moduleState, effectivePlan } from "@/lib/entitlements";
import { fetchAccountContext, setModuleEnabled, AccountContext } from "@/lib/account";

const CATEGORIES: ModuleCategory[] = [
  "Discovery",
  "Jobs & Bookings",
  "Care Plans",
  "Communications",
  "Business / Institutional",
  "Marketplace",
  "Pro Tools",
  "Analytics & AI",
];

export default function ModulesSettings() {
  const [ctx, setCtx] = useState<AccountContext | null>(null);

  async function load() {
    setCtx(await fetchAccountContext());
  }
  useEffect(() => { load(); }, []);

  const plan = ctx ? effectivePlan(ctx.entitlements) : "free";
  const limits = PLAN_LIMITS[plan];

  const byCategory = useMemo(() => {
    const map: Record<string, AppModule[]> = {};
    for (const m of MODULES) (map[m.category] ??= []).push(m);
    return map;
  }, []);

  async function toggle(moduleId: string, enabled: boolean) {
    if (!ctx?.account.id) return;
    await setModuleEnabled(ctx.account.id, moduleId, enabled);
    load();
  }

  if (!ctx) return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-brand-ink/60">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-ink">Modules & Plan</h1>
      <p className="mt-1 text-brand-ink/60">Turn features on, see what's included, and upgrade for more.</p>

      {/* Plan + usage banner */}
      <div className="mt-6 overflow-hidden rounded-xl2 bg-gradient-to-r from-brand-coral to-brand-violet p-6 text-white shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-white/80">Current plan</p>
            <p className="text-2xl font-extrabold">
              {PLAN_LABEL[plan]}
              {ctx.account.founding && <span className="ml-2 rounded-full bg-white/25 px-2 py-0.5 text-xs">Founding</span>}
            </p>
            {ctx.account.plan_expires_at && (
              <p className="text-xs text-white/80">
                {ctx.account.founding ? "Founding access until " : "Renews "}
                {new Date(ctx.account.plan_expires_at).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
          <Link href="/upgrade" className="rounded-full bg-white px-6 py-3 font-bold text-brand-coral transition hover:bg-orange-50">
            {plan === "premium" ? "Manage plan" : "Upgrade"}
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(limits) as LimitKey[]).map((k) => {
            const max = limits[k];
            const used = ctx.usage[k] ?? 0;
            const near = max !== -1 && used / max >= 0.8;
            return (
              <div key={k} className="rounded-xl bg-white/15 p-3">
                <p className="text-xs text-white/80">{LIMIT_LABEL[k]}</p>
                <p className="text-lg font-extrabold">
                  {used}
                  <span className="text-sm font-normal text-white/70"> / {max === -1 ? "∞" : max}</span>
                </p>
                {near && <p className="text-[10px] font-bold text-yellow-200">Near limit — upgrade</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Module grid by category */}
      {CATEGORIES.map((cat) => (
        <section key={cat} className="mt-8">
          <h2 className="text-lg font-extrabold text-brand-ink">{cat}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(byCategory[cat] ?? []).map((m) => (
              <ModuleCard key={m.id} mod={m} ctx={ctx} onToggle={toggle} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ModuleCard({
  mod,
  ctx,
  onToggle,
}: {
  mod: AppModule;
  ctx: AccountContext;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const state = moduleState(ctx.entitlements, mod.id);

  return (
    <div className="flex flex-col rounded-xl2 border border-orange-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div className="text-3xl">{mod.icon}</div>
        {state.status === "included" && (
          <span className="rounded-full bg-brand-teal/15 px-2.5 py-1 text-xs font-bold text-brand-teal">Included</span>
        )}
        {state.status === "addon" && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Add-on</span>
        )}
        {state.status === "locked" && (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">🔒 Locked</span>
        )}
      </div>

      <h3 className="mt-3 font-bold text-brand-ink">{mod.name}</h3>
      <p className="mt-1 flex-1 text-sm text-brand-ink/60">{mod.description}</p>

      <div className="mt-4">
        {state.status === "included" && state.optional && (
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-sm font-semibold text-brand-ink/70">{state.enabled ? "On" : "Off"}</span>
            <input
              type="checkbox"
              checked={state.enabled}
              onChange={(e) => onToggle(mod.id, e.target.checked)}
              className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-200 transition checked:bg-brand-teal"
            />
          </label>
        )}
        {state.status === "included" && !state.optional && (
          <span className="text-sm font-semibold text-brand-teal">✓ Active</span>
        )}
        {state.status === "addon" && (
          <Link href={`/upgrade?addon=${mod.id}`} className="block rounded-full border-2 border-brand-coral px-4 py-2 text-center text-sm font-bold text-brand-coral transition hover:bg-orange-50">
            Add for ₹{state.priceMonthly}/mo
          </Link>
        )}
        {state.status === "locked" && (
          <Link href={`/upgrade?need=${state.needsPlan}`} className="block rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-4 py-2 text-center text-sm font-bold text-white shadow-glow">
            Available on {PLAN_LABEL[state.needsPlan]} → Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}
