"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/data";
import { SERVICES, DEFAULT_SERVICE, skillsForService } from "@/lib/services";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";

export default function PostJob() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    service: DEFAULT_SERVICE,
    type: skillsForService(DEFAULT_SERVICE)[0],
    city: CITIES[0],
    area: "",
    budget: "",
    details: "",
  });

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Sample mode (no Supabase): just show the happy screen.
    if (!isSupabaseReady || !supabase) {
      setSent(true);
      return;
    }

    setBusy(true);
    // Must be logged in to post (RLS needs your user id).
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      router.push("/login");
      return;
    }

    const { error: insErr } = await supabase.from("jobs").insert({
      customer_id: s.session.user.id,
      title: form.title,
      service: form.service,
      type: form.type,
      city: form.city,
      area: form.area,
      budget: form.budget ? Number(form.budget) : null,
      details: form.details,
      status: "open",
    });

    setBusy(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-4 text-3xl font-extrabold text-brand-ink">Job posted!</h1>
        <p className="mt-2 text-brand-ink/60">
          Painters near you will see it and send quotes soon. We will tell you when they do.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/painters" className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow">
            Browse painters
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
      <h1 className="text-3xl font-extrabold text-brand-ink">Post a Job</h1>
      <p className="mt-1 text-brand-ink/60">Tell us what you need. It's free!</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft"
      >
        <Field label="Which service?">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SERVICES.map((s) => (
              <button
                type="button"
                key={s.slug}
                onClick={() => setForm({ ...form, service: s.slug, type: skillsForService(s.slug)[0] })}
                className={`rounded-xl border p-3 text-center text-sm font-bold transition ${
                  form.service === s.slug
                    ? "border-brand-coral bg-orange-50 text-brand-coral"
                    : "border-orange-100 text-brand-ink/60 hover:bg-orange-50"
                }`}
              >
                <div className="text-2xl">{s.emoji}</div>
                {s.name}
              </button>
            ))}
          </div>
        </Field>

        <Field label="What do you need?">
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Paint my 2 BHK flat"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type of work">
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="input">
              {skillsForService(form.service).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="City">
            <select value={form.city} onChange={(e) => set("city", e.target.value)} className="input">
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="How big? (area)">
            <input
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="e.g. 2 BHK, office hall"
              className="input"
            />
          </Field>
          <Field label="Your budget (₹)">
            <input
              type="number"
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
              placeholder="e.g. 18000"
              className="input"
            />
          </Field>
        </div>

        <Field label="More details">
          <textarea
            value={form.details}
            onChange={(e) => set("details", e.target.value)}
            rows={4}
            placeholder="Tell painters anything they should know..."
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-full bg-gradient-to-r from-brand-coral to-brand-violet py-3.5 font-bold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Posting..." : "Post Job — it's free"}
        </button>
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
