"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/auth";
import { fetchPlanRequests, activatePlan, declinePlanRequest, findCustomerIdByEmail } from "@/lib/plans";
import AddPainterForm from "@/components/AddPainterForm";

type Row = any;

export default function Admin() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [painters, setPainters] = useState<Row[]>([]);
  const [jobs, setJobs] = useState<Row[]>([]);
  const [reviews, setReviews] = useState<Row[]>([]);
  const [planRequests, setPlanRequests] = useState<Row[]>([]);

  const load = useCallback(async () => {
    if (!supabase) return;
    const [p, j, r, pr] = await Promise.all([
      supabase.from("painter_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("jobs").select("*").eq("status", "open"),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      fetchPlanRequests(),
    ]);
    setPainters(p.data ?? []);
    setJobs(j.data ?? []);
    setReviews(r.data ?? []);
    setPlanRequests(pr);
  }, []);

  useEffect(() => {
    if (!isSupabaseReady) { setAllowed(false); return; }
    isAdmin().then((ok) => {
      setAllowed(ok);
      if (ok) load();
    });
  }, [load]);

  async function approve(id: string, verified: boolean) {
    if (!supabase) return;
    await supabase.from("painter_profiles").update({ verified }).eq("id", id);
    load();
  }

  async function removePainter(id: string) {
    if (!supabase) return;
    await supabase.from("painter_profiles").delete().eq("id", id);
    load();
  }

  if (allowed === null) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-brand-ink/60">Loading...</div>;
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-3 text-2xl font-extrabold text-brand-ink">Admins only</h1>
        <p className="mt-2 text-brand-ink/60">
          You need an admin account to see this page. Log in with your admin email,
          and make sure your profile role is set to <b>admin</b> in Supabase.
        </p>
        <Link href="/login" className="mt-5 inline-block rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow">
          Log in
        </Link>
      </div>
    );
  }

  const pending = painters.filter((p) => !p.verified);
  const newRequests = planRequests.filter((r) => r.status === "requested");
  const stats = [
    { label: "Pros", value: painters.length, icon: "👷" },
    { label: "Open jobs", value: jobs.length, icon: "💼" },
    { label: "Plan requests", value: newRequests.length, icon: "🛡️" },
    { label: "To verify", value: pending.length, icon: "🔎" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-ink">Admin</h1>
          <p className="mt-1 text-brand-ink/60">Keep the platform safe and friendly.</p>
        </div>
        <AddPainterForm onAdded={load} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl2 border border-orange-100 bg-white p-5 shadow-soft">
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-2 text-2xl font-extrabold text-brand-ink">{s.value}</div>
            <div className="text-sm text-brand-ink/60">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Care Plan requests */}
      <h2 className="mt-8 text-xl font-extrabold text-brand-ink">Care Plan requests</h2>
      <div className="mt-4 space-y-3">
        {planRequests.length === 0 && (
          <p className="rounded-xl2 border border-orange-100 bg-white p-6 text-center text-brand-ink/60">
            No plan requests yet.
          </p>
        )}
        {planRequests.map((r) => (
          <PlanRequestRow key={r.id} req={r} onChange={load} />
        ))}
      </div>

      {/* All painters */}
      <h2 className="mt-8 text-xl font-extrabold text-brand-ink">All pros</h2>
      <div className="mt-4 space-y-3">
        {painters.length === 0 && (
          <p className="rounded-xl2 border border-orange-100 bg-white p-6 text-center text-brand-ink/60">
            No pros yet. Click "Add a pro" to list your first one.
          </p>
        )}
        {painters.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft">
            <Link href={`/painters/${p.id}`} className="flex items-center gap-3">
              <img src={p.photo || "https://i.pravatar.cc/100"} alt={p.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-brand-ink">
                  {p.name}{" "}
                  {p.verified
                    ? <span className="rounded-full bg-brand-teal px-2 py-0.5 text-xs font-bold text-white">✓ Verified</span>
                    : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Pending</span>}
                  {!p.user_id && <span className="ml-1 text-xs text-brand-ink/40">(no account)</span>}
                </p>
                <p className="text-sm text-brand-ink/60">📍 {p.city || "—"} · {(p.skills ?? []).join(", ") || "no skills"} {p.phone ? `· 📞 ${p.phone}` : ""}</p>
              </div>
            </Link>
            <div className="flex gap-2">
              {p.verified ? (
                <button onClick={() => approve(p.id, false)} className="rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-brand-ink/60">
                  Un-verify
                </button>
              ) : (
                <button onClick={() => approve(p.id, true)} className="rounded-full bg-brand-teal px-4 py-2 text-sm font-bold text-white">
                  Approve
                </button>
              )}
              <button onClick={() => removePainter(p.id)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent reviews */}
      <h2 className="mt-8 text-xl font-extrabold text-brand-ink">Recent reviews</h2>
      <div className="mt-4 space-y-3">
        {reviews.length === 0 && (
          <p className="rounded-xl2 border border-orange-100 bg-white p-6 text-center text-brand-ink/60">No reviews yet.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft">
            <p className="font-bold text-brand-ink">{r.customer_name ?? "Customer"} · {r.stars}★</p>
            <p className="text-sm text-brand-ink/70">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanRequestRow({ req, onChange }: { req: Row; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState("");
  const [visits, setVisits] = useState("4");
  const today = new Date().toISOString().slice(0, 10);
  const [startsOn, setStartsOn] = useState(today);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  const isNew = req.status === "requested";

  const badge =
    req.status === "active"
      ? <span className="rounded-full bg-brand-teal px-2 py-0.5 text-xs font-bold text-white">Active</span>
      : req.status === "declined"
      ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">Declined</span>
      : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">New</span>;

  async function activate() {
    if (!price) return;
    setErr("");
    setBusy(true);
    try {
      let customerId: string | null = req.customer_id ?? null;
      if (email.trim()) {
        customerId = await findCustomerIdByEmail(email.trim());
        if (!customerId) {
          setErr(`No login account found for ${email.trim()}. Create the account first, then activate.`);
          return;
        }
      }
      await activatePlan(req, {
        yearlyPrice: Number(price),
        visitsPerYear: Number(visits),
        startsOn,
        customerId,
      });
      onChange();
    } catch (e: any) {
      setErr(e.message ?? "Could not activate. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    setBusy(true);
    try {
      await declinePlanRequest(req.id);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-brand-ink">
            {req.property_kind} {badge}{" "}
            <span className="text-sm font-normal text-brand-ink/50">· {req.segment}</span>
          </p>
          <p className="mt-1 text-sm text-brand-ink/70">
            {req.size_note || "—"} · {(req.services ?? []).join(", ") || "no services"}
          </p>
          <p className="text-sm text-brand-ink/60">
            📍 {req.city || "—"}{req.area ? `, ${req.area}` : ""} · 👤 {req.contact_name || "—"}
            {req.phone ? ` · 📞 ${req.phone}` : ""}
          </p>
          {req.notes && <p className="mt-1 text-sm text-brand-ink/50 italic">"{req.notes}"</p>}
        </div>
        {isNew && (
          <div className="flex gap-2">
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-4 py-2 text-sm font-bold text-white shadow-glow"
            >
              {open ? "Close" : "Quote & activate"}
            </button>
            <button
              onClick={decline}
              disabled={busy}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 disabled:opacity-60"
            >
              Decline
            </button>
          </div>
        )}
      </div>

      {isNew && open && (
        <div className="mt-4 grid gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-4 sm:grid-cols-4">
          <label className="block sm:col-span-4">
            <span className="mb-1 block text-xs font-semibold text-brand-ink/70">
              Customer login email{" "}
              <span className="font-normal text-brand-ink/40">
                — the account you created for them (leave blank to skip linking)
              </span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={req.customer_id ? "Already linked — optional" : "customer@example.com"}
              className="w-full rounded-lg border border-orange-200 px-3 py-2 outline-none focus:border-brand-coral"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-brand-ink/70">Yearly price (₹)</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 24000"
              className="w-full rounded-lg border border-orange-200 px-3 py-2 outline-none focus:border-brand-coral"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-brand-ink/70">Visits / year</span>
            <input
              type="number"
              value={visits}
              onChange={(e) => setVisits(e.target.value)}
              className="w-full rounded-lg border border-orange-200 px-3 py-2 outline-none focus:border-brand-coral"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-brand-ink/70">Starts on</span>
            <input
              type="date"
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              className="w-full rounded-lg border border-orange-200 px-3 py-2 outline-none focus:border-brand-coral"
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={activate}
              disabled={busy || !price}
              className="w-full rounded-full bg-brand-teal px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy ? "Saving..." : "Create plan"}
            </button>
          </div>
          {err && <p className="text-sm text-red-500 sm:col-span-4">{err}</p>}
        </div>
      )}
    </div>
  );
}
