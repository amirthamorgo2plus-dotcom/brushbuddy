"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseReady } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/auth";
import {
  SLOT_TIMES,
  BookingStatus,
  fetchCleaningBookings,
  updateCleaningBookingStatus,
  isoDate,
  slotLabel,
} from "@/lib/cleaning";

type Row = any;

const STATUS_STYLE: Record<string, string> = {
  booked: "bg-amber-100 text-amber-700",
  confirmed: "bg-violet-100 text-brand-violet",
  done: "bg-brand-teal text-white",
  cancelled: "bg-red-100 text-red-600",
};

const RANGES = [
  { id: "upcoming", label: "Upcoming", daysBack: 0 },
  { id: "week", label: "Incl. last 7 days", daysBack: 7 },
  { id: "month", label: "Incl. last 30 days", daysBack: 30 },
];

function longDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function AdminBookings() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [range, setRange] = useState(RANGES[0]);
  const [showCancelled, setShowCancelled] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const d = new Date();
    const from = isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - range.daysBack));
    try {
      setRows(await fetchCleaningBookings(from));
      setError("");
    } catch (e: any) {
      setError(e.message ?? "Could not load bookings.");
    }
  }, [range]);

  useEffect(() => {
    if (!isSupabaseReady) { setAllowed(false); return; }
    isAdmin().then((ok) => {
      setAllowed(ok);
      if (ok) load();
    });
  }, [load]);

  async function setStatus(id: string, status: BookingStatus) {
    try {
      await updateCleaningBookingStatus(id, status);
      load();
    } catch (e: any) {
      setError(e.message ?? "Could not update booking.");
    }
  }

  if (allowed === null) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-brand-ink/60">Loading...</div>;
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-3 text-2xl font-extrabold text-brand-ink">Admins only</h1>
        <Link href="/login" className="mt-5 inline-block rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow">
          Log in
        </Link>
      </div>
    );
  }

  const today = isoDate(new Date());
  const active = rows.filter((r) => r.status !== "cancelled");
  const visible = showCancelled ? rows : active;
  const stats = [
    { label: "Today", value: active.filter((r) => r.slot_date === today).length, icon: "📅" },
    { label: "Upcoming", value: active.filter((r) => r.slot_date >= today && r.status !== "done").length, icon: "🧼" },
    { label: "To confirm", value: rows.filter((r) => r.status === "booked").length, icon: "📞" },
    { label: "Cancelled", value: rows.length - active.length, icon: "✖️" },
  ];

  // Group by date, then slot.
  const byDate = new Map<string, Row[]>();
  for (const r of visible) {
    if (!byDate.has(r.slot_date)) byDate.set(r.slot_date, []);
    byDate.get(r.slot_date)!.push(r);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/admin" className="text-sm font-bold text-brand-coral hover:underline">← Admin</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-ink">Deep Cleaning bookings</h1>
          <p className="mt-1 text-brand-ink/60">Every slot booked by customers, soonest first.</p>
        </div>
        <button onClick={load} className="rounded-full border-2 border-brand-coral px-4 py-2 text-sm font-bold text-brand-coral hover:bg-orange-50">
          ↻ Refresh
        </button>
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

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              range.id === r.id ? "bg-orange-100 text-brand-coral" : "text-brand-ink/60 hover:bg-orange-50"
            }`}
          >
            {r.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-brand-ink/60">
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
          Show cancelled
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {byDate.size === 0 && (
        <p className="mt-6 rounded-xl2 border border-orange-100 bg-white p-6 text-center text-brand-ink/60">
          No bookings yet.
        </p>
      )}

      {Array.from(byDate.entries()).map(([date, list]) => (
        <section key={date} className="mt-8">
          <h2 className="text-xl font-extrabold text-brand-ink">
            {longDate(date)} {date === today && <span className="ml-1 rounded-full bg-brand-coral px-2 py-0.5 text-xs font-bold text-white">Today</span>}
            <span className="ml-2 text-sm font-normal text-brand-ink/50">
              {list.filter((r) => r.status !== "cancelled").length} booking(s)
            </span>
          </h2>
          {SLOT_TIMES.map((s) => {
            const inSlot = list.filter((r) => r.slot_time === s.value);
            if (inSlot.length === 0) return null;
            return (
              <div key={s.value} className="mt-3">
                <p className="text-sm font-bold text-brand-ink/60">🕘 {s.label}</p>
                <div className="mt-2 space-y-2">
                  {inSlot.map((r) => <BookingRow key={r.id} b={r} onStatus={setStatus} />)}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function BookingRow({ b, onStatus }: { b: Row; onStatus: (id: string, s: BookingStatus) => void }) {
  return (
    <div className={`rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft ${b.status === "cancelled" ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-brand-ink">
            {b.contact_name}{" "}
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[b.status] ?? ""}`}>{b.status}</span>{" "}
            <span className="font-mono text-xs font-normal text-brand-ink/40">#{String(b.id).slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="mt-1 text-sm text-brand-ink/70">
            {b.package} · {b.home_size || "—"} · {slotLabel(b.slot_time)}
          </p>
          <p className="text-sm text-brand-ink/60">
            📍 {b.address}{b.area ? `, ${b.area}` : ""}{b.city ? `, ${b.city}` : ""}
          </p>
          <p className="text-sm">
            <a href={`tel:${b.phone}`} className="font-bold text-brand-coral hover:underline">📞 {b.phone}</a>
          </p>
          {b.notes && <p className="mt-1 text-sm italic text-brand-ink/50">"{b.notes}"</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {b.status === "booked" && (
            <button onClick={() => onStatus(b.id, "confirmed")} className="rounded-full bg-brand-violet px-4 py-2 text-sm font-bold text-white">
              Confirm
            </button>
          )}
          {(b.status === "booked" || b.status === "confirmed") && (
            <>
              <button onClick={() => onStatus(b.id, "done")} className="rounded-full bg-brand-teal px-4 py-2 text-sm font-bold text-white">
                Mark done
              </button>
              <button onClick={() => onStatus(b.id, "cancelled")} className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50">
                Cancel
              </button>
            </>
          )}
          {b.status === "cancelled" && (
            <button onClick={() => onStatus(b.id, "booked")} className="rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-brand-ink/60">
              Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
