"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";
import { fetchMyQuotes, fetchMyBookings, updateBookingStatus, getMyPainterId } from "@/lib/bookings";

export default function MyWork() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const load = useCallback(async () => {
    setQuotes(await fetchMyQuotes());
    const { asPainter } = await fetchMyBookings();
    setBookings(asPainter);
  }, []);

  useEffect(() => {
    if (!isSupabaseReady || !supabase) { setReady(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      const pid = await getMyPainterId();
      setHasProfile(!!pid);
      setReady(true);
      if (pid) load();
    });
  }, [router, load]);

  async function setStatus(id: string, status: string) {
    await updateBookingStatus(id, status);
    load();
  }

  if (ready === null) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-brand-ink/60">Loading…</div>;
  if (!ready) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-brand-ink/60">Please log in.</div>;

  if (!hasProfile) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-5xl">🎨</div>
        <h1 className="mt-3 text-2xl font-extrabold text-brand-ink">Set up your painter profile</h1>
        <p className="mt-2 text-brand-ink/60">Create your profile first, then you can send quotes and get bookings.</p>
        <Link href="/onboarding" className="mt-5 inline-block rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-3 font-bold text-white shadow-glow">
          Set up profile
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-brand-ink">My Work</h1>
        <Link href="/jobs" className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-5 py-2.5 text-sm font-bold text-white shadow-glow">
          Find jobs
        </Link>
      </div>

      {/* Bookings */}
      <h2 className="mt-8 text-xl font-extrabold text-brand-ink">My bookings</h2>
      <div className="mt-4 space-y-3">
        {bookings.length === 0 && (
          <p className="rounded-xl2 border border-orange-100 bg-white p-6 text-center text-brand-ink/60">
            No bookings yet. Send quotes on open jobs to win work!
          </p>
        )}
        {bookings.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft">
            <div>
              <p className="font-bold text-brand-ink">{b.jobs?.title ?? "Job"}</p>
              <p className="text-sm text-brand-ink/60">
                📍 {b.jobs?.area ? `${b.jobs.area}, ` : ""}{b.jobs?.city} · ₹{(b.amount ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {b.status === "scheduled" && (
                <button onClick={() => setStatus(b.id, "in_progress")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white">
                  Start work
                </button>
              )}
              {b.status === "in_progress" && (
                <button onClick={() => setStatus(b.id, "completed")} className="rounded-full bg-brand-teal px-4 py-2 text-xs font-bold text-white">
                  Mark done
                </button>
              )}
              {b.status === "completed" && (
                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">✓ Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quotes */}
      <h2 className="mt-8 text-xl font-extrabold text-brand-ink">My quotes</h2>
      <div className="mt-4 space-y-3">
        {quotes.length === 0 && (
          <p className="rounded-xl2 border border-orange-100 bg-white p-6 text-center text-brand-ink/60">
            You haven't sent any quotes yet. <Link href="/jobs" className="font-bold text-brand-coral">See open jobs →</Link>
          </p>
        )}
        {quotes.map((q) => (
          <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft">
            <div>
              <p className="font-bold text-brand-ink">{q.jobs?.title ?? "Job"}</p>
              <p className="text-sm text-brand-ink/60">
                📍 {q.jobs?.city} · You quoted ₹{(q.amount ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            {q.status === "accepted" ? (
              <span className="rounded-full bg-brand-teal px-3 py-1.5 text-xs font-bold text-white">✓ Accepted</span>
            ) : q.status === "rejected" ? (
              <span className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-bold text-gray-500">Not chosen</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">● Waiting</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
