"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";
import { fetchMyPlans, raiseClaim } from "@/lib/plans";
import { fetchAccountContext } from "@/lib/account";
import { isEntitled } from "@/lib/entitlements";
import { serviceName } from "@/lib/services";

export default function MyPlan() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  const load = useCallback(async () => {
    setPlans(await fetchMyPlans());
  }, []);

  useEffect(() => {
    if (!isSupabaseReady || !supabase) { setReady(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      // Plan gate: My Plan dashboard is a Starter+ module (founding → premium).
      const ctx = await fetchAccountContext();
      if (!isEntitled(ctx.entitlements, "my_plan")) {
        router.push("/upgrade?need=starter");
        return;
      }
      setReady(true);
      load();
    });
  }, [router, load]);

  if (ready === null) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-brand-ink/60">Loading…</div>;
  if (!ready) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-brand-ink/60">Please log in.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-ink">My Care Plan</h1>
          <p className="mt-1 text-brand-ink/60">Your yearly cover — visits, status and protection.</p>
        </div>
        <Link href="/plans/request" className="rounded-full border-2 border-brand-coral px-5 py-2.5 text-sm font-bold text-brand-coral">
          Request another plan
        </Link>
      </div>

      {plans.length === 0 && (
        <div className="mt-8 rounded-xl2 border border-orange-100 bg-white p-10 text-center shadow-soft">
          <div className="text-5xl">🛡️</div>
          <p className="mt-3 font-bold text-brand-ink">No active plan yet</p>
          <p className="mt-1 text-sm text-brand-ink/60">
            Once we activate your yearly Care Plan, it'll show up here with your schedule.
          </p>
          <Link href="/plans" className="mt-5 inline-block rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow">
            Explore Care Plans
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} onChange={load} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, onChange }: { plan: any; onChange: () => void }) {
  const visits = [...(plan.plan_visits ?? [])].sort(
    (a, b) => String(a.scheduled_for).localeCompare(String(b.scheduled_for))
  );
  const claims = plan.plan_claims ?? [];
  const upcoming = visits.filter((v) => v.status === "planned");
  const done = visits.filter((v) => v.status === "done");

  return (
    <div className="overflow-hidden rounded-xl2 border border-orange-100 bg-white shadow-soft">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-coral to-brand-violet p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-extrabold">{plan.title ?? "Care Plan"}</h2>
          <PlanStatus status={plan.status} />
        </div>
        <p className="mt-1 text-sm text-white/90">
          ₹{Number(plan.yearly_price ?? 0).toLocaleString("en-IN")}/year ·{" "}
          {plan.visits_per_year ?? 0} visits ·{" "}
          {fmt(plan.starts_on)} → {fmt(plan.ends_on)}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(plan.services ?? []).map((s: string) => (
            <span key={s} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
              {serviceName(s)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-2">
        {/* Schedule */}
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand-ink/50">
            Schedule
          </h3>
          <div className="mt-3 space-y-2">
            {visits.length === 0 && (
              <p className="text-sm text-brand-ink/50">
                We'll plan your visits shortly and they'll appear here.
              </p>
            )}
            {upcoming.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl bg-orange-50 p-3">
                <div>
                  <p className="text-sm font-bold text-brand-ink">{serviceName(v.service)}</p>
                  <p className="text-xs text-brand-ink/60">{fmt(v.scheduled_for)}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                  Planned
                </span>
              </div>
            ))}
            {done.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <div>
                  <p className="text-sm font-bold text-brand-ink/70">{serviceName(v.service)}</p>
                  <p className="text-xs text-brand-ink/50">{fmt(v.scheduled_for)}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                  ✓ Done
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Protection / claims */}
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand-ink/50">
            Protection
          </h3>
          <div className="mt-3 space-y-2">
            {claims.length === 0 && (
              <p className="text-sm text-brand-ink/50">
                Something covered gone wrong? Raise a claim and we'll fix it free.
              </p>
            )}
            {claims.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-orange-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-brand-ink">{serviceName(c.service)}</p>
                  <ClaimStatus status={c.status} />
                </div>
                <p className="mt-0.5 text-xs text-brand-ink/60">{c.description}</p>
              </div>
            ))}
          </div>
          {plan.status === "active" && (
            <ClaimForm plan={plan} onDone={onChange} />
          )}
        </div>
      </div>
    </div>
  );
}

function ClaimForm({ plan, onDone }: { plan: any; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const services: string[] = plan.services ?? [];
  const [service, setService] = useState(services[0] ?? "");
  const [desc, setDesc] = useState("");

  async function submit() {
    if (!desc) return;
    setBusy(true);
    try {
      await raiseClaim(plan.id, service, desc);
      setDesc("");
      setOpen(false);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-full border-2 border-brand-coral px-4 py-2 text-sm font-bold text-brand-coral transition hover:bg-orange-50"
      >
        Raise a protection claim
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-orange-100 bg-orange-50/40 p-3">
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:border-brand-coral"
      >
        {services.map((s) => (
          <option key={s} value={s}>{serviceName(s)}</option>
        ))}
      </select>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={2}
        placeholder="What went wrong?"
        className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:border-brand-coral"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy || !desc}
          className="flex-1 rounded-full bg-brand-teal px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? "Sending…" : "Submit claim"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-brand-ink/60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PlanStatus({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    active: ["bg-white/25 text-white", "● Active"],
    quoted: ["bg-white/25 text-white", "Quoted"],
    expired: ["bg-white/25 text-white", "Expired"],
    cancelled: ["bg-white/25 text-white", "Cancelled"],
  };
  const [cls, label] = map[status] ?? ["bg-white/25 text-white", status];
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{label}</span>;
}

function ClaimStatus({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    open: ["bg-amber-100 text-amber-700", "Open"],
    approved: ["bg-blue-100 text-blue-700", "Approved"],
    fixed: ["bg-green-100 text-green-700", "✓ Fixed"],
    rejected: ["bg-gray-200 text-gray-500", "Rejected"],
  };
  const [cls, label] = map[status] ?? ["bg-gray-100 text-gray-600", status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{label}</span>;
}

function fmt(d?: string) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
