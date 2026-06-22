"use client";

import { useState } from "react";
import Link from "next/link";
import { CITIES } from "@/lib/data";
import { SERVICES } from "@/lib/services";
import {
  PROPERTY_KINDS,
  PropertyKind,
  segmentFor,
  submitPlanRequest,
} from "@/lib/plans";

export default function PlanRequest() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    propertyKind: PROPERTY_KINDS[0] as PropertyKind,
    sizeNote: "",
    services: [SERVICES[0].slug] as string[],
    city: CITIES[0],
    area: "",
    contactName: "",
    phone: "",
    notes: "",
  });

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const segment = segmentFor(form.propertyKind);

  function toggleService(slug: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(slug)
        ? f.services.filter((s) => s !== slug)
        : [...f.services, slug],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await submitPlanRequest({ ...form, segment });
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="text-6xl">🛡️</div>
        <h1 className="mt-4 text-3xl font-extrabold text-brand-ink">Plan request received!</h1>
        <p className="mt-2 text-brand-ink/60">
          We'll size a yearly Care Plan for your {segment === "business" ? "property" : "home"} and
          get back to you with a custom quote. No payment now.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/plans" className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow">
            Back to plans
          </Link>
          <Link href="/" className="rounded-full border-2 border-brand-coral px-6 py-3 font-bold text-brand-coral">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-ink">Get your Care Plan</h1>
      <p className="mt-1 text-brand-ink/60">
        Tell us about your property — we'll build a yearly plan and send a custom quote. It's free to ask.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft"
      >
        <Field label="What kind of property?">
          <select
            value={form.propertyKind}
            onChange={(e) => set("propertyKind", e.target.value as PropertyKind)}
            className="input"
          >
            {PROPERTY_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-brand-ink/50">
            {segment === "business"
              ? "Business property — we'll size the plan to your premises."
              : "Home plan — simpler, priced for your household."}
          </span>
        </Field>

        <Field label="How big? (helps us size it)">
          <input
            required
            value={form.sizeNote}
            onChange={(e) => set("sizeNote", e.target.value)}
            placeholder={segment === "business" ? "e.g. 40-room hotel, 8000 sq ft" : "e.g. 3 BHK, 1800 sq ft villa"}
            className="input"
          />
        </Field>

        <Field label="Which services should the plan cover?">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SERVICES.map((s) => {
              const on = form.services.includes(s.slug);
              return (
                <button
                  type="button"
                  key={s.slug}
                  onClick={() => toggleService(s.slug)}
                  className={`rounded-xl border p-3 text-center text-sm font-bold transition ${
                    on
                      ? "border-brand-coral bg-orange-50 text-brand-coral"
                      : "border-orange-100 text-brand-ink/60 hover:bg-orange-50"
                  }`}
                >
                  <div className="text-2xl">{s.emoji}</div>
                  {s.name}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City">
            <select value={form.city} onChange={(e) => set("city", e.target.value)} className="input">
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Area / locality">
            <input
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="e.g. RS Puram"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Your name">
            <input
              required
              value={form.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              placeholder="Full name"
              className="input"
            />
          </Field>
          <Field label="Phone">
            <input
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="10-digit mobile"
              className="input"
            />
          </Field>
        </div>

        <Field label="Anything else we should know?">
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Current condition, problem areas, how often you'd like visits..."
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          disabled={busy || form.services.length === 0}
          className="w-full rounded-full bg-gradient-to-r from-brand-coral to-brand-violet py-3.5 font-bold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Sending..." : "Request my custom plan"}
        </button>
        <p className="text-center text-xs text-brand-ink/50">
          No payment now — we'll send a quote first.
        </p>
      </form>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #ffe0d4;
          padding: 0.7rem 0.9rem;
          outline: none;
        }
        .input:focus { border-color: #ff7a59; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-brand-ink/70">{label}</span>
      {children}
    </label>
  );
}
