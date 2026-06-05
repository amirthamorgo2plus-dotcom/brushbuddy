"use client";

import { useState } from "react";
import { CITIES, areasFor } from "@/lib/data";
import { SERVICES, DEFAULT_SERVICE, skillsForService } from "@/lib/services";
import { supabase } from "@/lib/supabaseClient";
import ImageUpload from "@/components/ImageUpload";

export default function AddPainterForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    service: DEFAULT_SERVICE,
    city: CITIES[0],
    area: "",
    phone: "",
    pricePerDay: "",
    skills: [] as string[],
    photo: "",
    about: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSkill = (s: string) =>
    set("skills", form.skills.includes(s) ? form.skills.filter((x) => x !== s) : [...form.skills, s]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) return;
    setBusy(true);
    const { error: insErr } = await supabase.from("painter_profiles").insert({
      name: form.name,
      service: form.service,
      city: form.city,
      area: form.area || null,
      phone: form.phone,
      price_per_day: form.pricePerDay ? Number(form.pricePerDay) : 0,
      skills: form.skills,
      photo: form.photo,
      about: form.about,
      verified: true, // you added them, so they're trusted
    });
    setBusy(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setForm({ name: "", service: DEFAULT_SERVICE, city: CITIES[0], area: "", phone: "", pricePerDay: "", skills: [], photo: "", about: "" });
    setOpen(false);
    onAdded();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow transition hover:opacity-90"
      >
        + Add a pro
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-ink">Add a pro (no account needed)</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-brand-ink/40 hover:text-brand-ink">✕</button>
      </div>
      <p className="mt-1 text-sm text-brand-ink/60">For pros you onboard yourself. They appear on the site right away.</p>

      <Field label="Service">
        <select
          value={form.service}
          onChange={(e) => { set("service", e.target.value); set("skills", []); }}
          className="ap-input"
        >
          {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.emoji} {s.name}</option>)}
        </select>
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Pro name">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ravi Kumar" className="ap-input" />
        </Field>
        <Field label="Phone (to contact)">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 98765 43210" className="ap-input" />
        </Field>
        <Field label="City">
          <select
            value={form.city}
            onChange={(e) => { set("city", e.target.value); set("area", ""); }}
            className="ap-input"
          >
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        {areasFor(form.city).length > 0 ? (
          <Field label="Area (locality)">
            <select value={form.area} onChange={(e) => set("area", e.target.value)} className="ap-input">
              <option value="">Select area</option>
              {areasFor(form.city).map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
        ) : (
          <Field label="Area (optional)">
            <input value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Locality" className="ap-input" />
          </Field>
        )}
        <Field label="Day rate (₹)">
          <input type="number" value={form.pricePerDay} onChange={(e) => set("pricePerDay", e.target.value)} placeholder="e.g. 1000" className="ap-input" />
        </Field>
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-sm font-semibold text-brand-ink/70">Work types</span>
        <div className="flex flex-wrap gap-2">
          {skillsForService(form.service).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => toggleSkill(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                form.skills.includes(s)
                  ? "bg-gradient-to-r from-brand-coral to-brand-violet text-white shadow-glow"
                  : "bg-orange-50 text-brand-coral hover:bg-orange-100"
              }`}
            >
              {form.skills.includes(s) ? "✓ " : ""}{s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <Field label="Photo">
          <ImageUpload value={form.photo} onChange={(v) => set("photo", v)} folder="painters" round />
        </Field>
        <Field label="About">
          <textarea value={form.about} onChange={(e) => set("about", e.target.value)} rows={2} placeholder="Short note about this pro..." className="ap-input" />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <button disabled={busy} className="mt-4 w-full rounded-full bg-gradient-to-r from-brand-coral to-brand-violet py-3 font-bold text-white shadow-glow disabled:opacity-60">
        {busy ? "Adding..." : "Add pro"}
      </button>

      <style>{`
        .ap-input { width:100%; border-radius:0.75rem; border:1px solid #ffe0d4; padding:0.6rem 0.8rem; outline:none; }
        .ap-input:focus { border-color:#ff7a59; }
      `}</style>
    </form>
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
