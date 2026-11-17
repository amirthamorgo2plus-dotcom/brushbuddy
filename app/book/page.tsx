"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CITIES } from "@/lib/data";
import { getService } from "@/lib/services";
import {
  SLOT_TIMES,
  HOME_SIZES,
  Availability,
  bookableDates,
  fetchAvailability,
  bookCleaningSlot,
  slotKey,
  slotLabel,
} from "@/lib/cleaning";

const service = getService("deep-cleaning")!;

function dayParts(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return {
    weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
    long: d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }),
  };
}

export default function BookDeepCleaning() {
  // Dates are computed in the browser (the page is prerendered at build time).
  const [dates, setDates] = useState<string[]>([]);
  const [avail, setAvail] = useState<Availability | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bookedId, setBookedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    pkg: service.skills[0],
    homeSize: HOME_SIZES[1],
    city: CITIES[0],
    area: "",
    address: "",
    contactName: "",
    phone: "",
    notes: "",
  });
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const load = useCallback(async (ds: string[]) => {
    try {
      setAvail(await fetchAvailability(ds[0], ds[ds.length - 1]));
      setLoadErr("");
    } catch {
      setLoadErr("Couldn't load free slots. Please refresh.");
    }
  }, []);

  useEffect(() => {
    const ds = bookableDates();
    setDates(ds);
    setDate(ds[0]);
    load(ds);
  }, [load]);

  const left = (d: string, t: string) =>
    avail ? Math.max(0, avail.capacity - (avail.booked[slotKey(d, t)] ?? 0)) : 0;
  const freeOnDay = (d: string) => SLOT_TIMES.reduce((n, s) => n + left(d, s.value), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!time) {
      setError("Please pick a time slot.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const id = await bookCleaningSlot({ ...form, date, time });
      setBookedId(id);
    } catch (err: any) {
      if (String(err.message).includes("SLOT_FULL")) {
        setError("Sorry — that slot just filled up. Please pick another one.");
        setTime("");
        load(dates);
      } else {
        setError(err.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (bookedId !== null) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="text-6xl">🧼</div>
        <h1 className="mt-4 text-3xl font-extrabold text-brand-ink">You're booked!</h1>
        <p className="mt-2 text-brand-ink/70">
          {form.pkg} · <b>{dayParts(date).long}</b> at <b>{slotLabel(time)}</b>
        </p>
        {bookedId && (
          <p className="mt-1 text-sm text-brand-ink/50">
            Booking ref: <span className="font-mono font-bold">{bookedId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
        <p className="mt-3 text-brand-ink/60">
          We'll call you on {form.phone} to confirm the details and price.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow"
        >
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-4">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${service.gradient} text-3xl shadow-glow`}>
          {service.emoji}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-brand-ink">Book a Deep Clean</h1>
          <p className="text-brand-ink/60">Pick a free slot — no login needed.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
        {/* Date */}
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-ink/70">1. Pick a day</p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {dates.map((d) => {
              const p = dayParts(d);
              const free = avail ? freeOnDay(d) : null;
              const full = free === 0;
              const on = d === date;
              return (
                <button
                  type="button"
                  key={d}
                  disabled={full}
                  onClick={() => { setDate(d); setTime(""); }}
                  className={`w-16 shrink-0 rounded-xl border p-2 text-center transition ${
                    on
                      ? "border-brand-coral bg-orange-50 text-brand-coral"
                      : full
                      ? "cursor-not-allowed border-orange-100 text-brand-ink/30"
                      : "border-orange-100 text-brand-ink/70 hover:bg-orange-50"
                  }`}
                >
                  <div className="text-xs font-semibold">{p.weekday}</div>
                  <div className="text-xl font-extrabold">{p.day}</div>
                  <div className="text-xs">{p.month}</div>
                  <div className={`mt-1 text-[10px] font-bold ${full ? "text-red-400" : "text-brand-teal"}`}>
                    {free === null ? "…" : full ? "Full" : `${free} free`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time */}
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-ink/70">
            2. Pick a time{date && ` on ${dayParts(date).long}`}
          </p>
          {loadErr && <p className="mb-2 text-sm text-red-500">{loadErr}</p>}
          <div className="grid grid-cols-3 gap-2">
            {SLOT_TIMES.map((s) => {
              const n = left(date, s.value);
              const full = avail !== null && n === 0;
              const on = time === s.value;
              return (
                <button
                  type="button"
                  key={s.value}
                  disabled={!avail || !date || full}
                  onClick={() => setTime(s.value)}
                  className={`rounded-xl border p-3 text-center font-bold transition ${
                    on
                      ? "border-brand-coral bg-orange-50 text-brand-coral"
                      : full
                      ? "cursor-not-allowed border-orange-100 text-brand-ink/30 line-through"
                      : "border-orange-100 text-brand-ink/70 hover:bg-orange-50"
                  }`}
                >
                  {s.label}
                  <div className={`text-xs font-semibold ${full ? "text-red-400" : "text-brand-teal"}`}>
                    {!avail ? "…" : full ? "Booked" : `${n} left`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-brand-ink/70">3. Your details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What needs cleaning?">
              <select value={form.pkg} onChange={(e) => set("pkg", e.target.value)} className="input">
                {service.skills.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Home size">
              <select value={form.homeSize} onChange={(e) => set("homeSize", e.target.value)} className="input">
                {HOME_SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="City">
              <select value={form.city} onChange={(e) => set("city", e.target.value)} className="input">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Area / locality">
              <input value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. RS Puram" className="input" />
            </Field>
          </div>
          <Field label="Full address">
            <textarea required rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Door no, street, landmark" className="input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name">
              <input required value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Full name" className="input" />
            </Field>
            <Field label="Phone">
              <input
                required
                type="tel"
                pattern="[0-9+ ]{10,15}"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="10-digit mobile"
                className="input"
              />
            </Field>
          </div>
          <Field label="Anything we should know? (optional)">
            <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Pets, parking, specific areas..." className="input" />
          </Field>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          disabled={busy || !time}
          className="w-full rounded-full bg-gradient-to-r from-brand-coral to-brand-violet py-3.5 font-bold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Booking..." : time ? `Book ${dayParts(date).weekday} ${dayParts(date).day} · ${slotLabel(time)}` : "Pick a time slot"}
        </button>
        <p className="text-center text-xs text-brand-ink/50">No payment now — we'll call to confirm.</p>
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
