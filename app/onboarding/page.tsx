"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CITIES, areasFor } from "@/lib/data";
import { SERVICES, DEFAULT_SERVICE, skillsForService } from "@/lib/services";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";
import ImageUpload from "@/components/ImageUpload";

export default function Onboarding() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [painterId, setPainterId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: "",
    service: DEFAULT_SERVICE,
    city: CITIES[0],
    area: "",
    about: "",
    skills: [] as string[],
    pricePerDay: "",
    photo: "",
    work1: "",
    work2: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Make sure a painter is logged in. If not, send them to login.
  useEffect(() => {
    if (!isSupabaseReady || !supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }
      setUserId(data.session.user.id);
      // Pre-fill from existing profile/painter profile if any.
      const { data: prof } = await supabase!
        .from("profiles")
        .select("name, city")
        .eq("id", data.session.user.id)
        .maybeSingle();
      const { data: pp } = await supabase!
        .from("painter_profiles")
        .select("*")
        .eq("user_id", data.session.user.id)
        .maybeSingle();
      if (pp?.id) setPainterId(pp.id);
      setForm((f) => ({
        ...f,
        name: pp?.name ?? prof?.name ?? f.name,
        service: pp?.service ?? f.service,
        city: pp?.city ?? prof?.city ?? f.city,
        area: pp?.area ?? f.area,
        about: pp?.about ?? f.about,
        skills: pp?.skills ?? f.skills,
        pricePerDay: pp?.price_per_day ? String(pp.price_per_day) : f.pricePerDay,
        photo: pp?.photo ?? f.photo,
      }));
      setChecking(false);
    });
  }, [router]);

  function toggleSkill(s: string) {
    set("skills", form.skills.includes(s) ? form.skills.filter((x) => x !== s) : [...form.skills, s]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSupabaseReady || !supabase || !userId) {
      setDone(true); // demo mode
      return;
    }
    if (form.skills.length === 0) {
      setError("Please pick at least one type of work.");
      return;
    }
    setBusy(true);

    // 1) Mark this account as a painter.
    await supabase.from("profiles").update({ name: form.name, role: "painter" }).eq("id", userId);

    // 2) Save the painter details (create or update) and get the painter id back.
    const { data: pp, error: ppErr } = await supabase
      .from("painter_profiles")
      .upsert(
        {
          user_id: userId,
          name: form.name,
          service: form.service,
          city: form.city,
          area: form.area || null,
          photo: form.photo,
          about: form.about,
          skills: form.skills,
          price_per_day: form.pricePerDay ? Number(form.pricePerDay) : 0,
        },
        { onConflict: "user_id" }
      )
      .select("id")
      .single();

    if (ppErr || !pp) {
      setBusy(false);
      setError(ppErr?.message ?? "Could not save. Try again.");
      return;
    }
    setPainterId(pp.id);

    // 3) Save up to 2 work photos (optional).
    const works = [form.work1, form.work2].filter(Boolean);
    if (works.length) {
      await supabase.from("portfolio_items").insert(
        works.map((url) => ({ painter_id: pp.id, image_url: url }))
      );
    }

    setBusy(false);
    setDone(true);
  }

  if (checking) {
    return <div className="mx-auto max-w-xl px-4 py-20 text-center text-brand-ink/60">Loading...</div>;
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-4 text-3xl font-extrabold text-brand-ink">Your profile is ready!</h1>
        <p className="mt-2 text-brand-ink/60">
          People can now find you on HomeBuddy. An admin will add your "Verified" badge soon.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {painterId && (
            <Link href={`/painters/${painterId}`} className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow">
              See my profile
            </Link>
          )}
          <Link href="/dashboard" className="rounded-full border-2 border-brand-coral px-6 py-3 font-bold text-brand-coral">
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand-ink">Set up your pro profile 🏠</h1>
      <p className="mt-1 text-brand-ink/60">Fill this once. It helps people pick you.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
        <Field label="Your name">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ravi Kumar" className="ob-input" />
        </Field>

        <Field label="What service do you offer?">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SERVICES.map((s) => (
              <button
                type="button"
                key={s.slug}
                onClick={() => { set("service", s.slug); set("skills", []); }}
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

        <div className="grid grid-cols-2 gap-4">
          <Field label="Your city">
            <select
              value={form.city}
              onChange={(e) => { set("city", e.target.value); set("area", ""); }}
              className="ob-input"
            >
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Day rate (₹)">
            <input type="number" value={form.pricePerDay} onChange={(e) => set("pricePerDay", e.target.value)} placeholder="e.g. 1000" className="ob-input" />
          </Field>
        </div>

        {areasFor(form.city).length > 0 && (
          <Field label="Your area (locality)">
            <select value={form.area} onChange={(e) => set("area", e.target.value)} className="ob-input">
              <option value="">Select your area</option>
              {areasFor(form.city).map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
        )}

        <Field label="What kind of work? (pick all that apply)">
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
        </Field>

        <Field label="About you">
          <textarea value={form.about} onChange={(e) => set("about", e.target.value)} rows={3} placeholder="Tell people why they'll love your work..." className="ob-input" />
        </Field>

        <Field label="Your photo">
          <ImageUpload value={form.photo} onChange={(v) => set("photo", v)} folder="painters" round />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Work photo 1">
            <ImageUpload value={form.work1} onChange={(v) => set("work1", v)} folder="work" />
          </Field>
          <Field label="Work photo 2">
            <ImageUpload value={form.work2} onChange={(v) => set("work2", v)} folder="work" />
          </Field>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={busy} className="w-full rounded-full bg-gradient-to-r from-brand-coral to-brand-violet py-3.5 font-bold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60">
          {busy ? "Saving..." : "Save my profile"}
        </button>
      </form>

      <style>{`
        .ob-input { width:100%; border-radius:0.75rem; border:1px solid #ffe0d4; padding:0.7rem 0.9rem; outline:none; }
        .ob-input:focus { border-color:#ff7a59; }
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
