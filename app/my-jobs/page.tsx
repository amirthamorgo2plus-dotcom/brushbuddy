"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";
import { fetchMyJobs, fetchMyBookings, acceptQuote } from "@/lib/bookings";

const STATUS_LABEL: Record<string, string> = {
  open: "Waiting for quotes",
  booked: "Booked",
  done: "Done",
};

export default function MyJobs() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const load = useCallback(async () => {
    setJobs(await fetchMyJobs());
    const { asCustomer } = await fetchMyBookings();
    setBookings(asCustomer);
  }, []);

  useEffect(() => {
    if (!isSupabaseReady || !supabase) { setReady(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/login"); return; }
      setReady(true);
      load();
    });
  }, [router, load]);

  async function onAccept(quote: any, jobId: string) {
    await acceptQuote(quote, jobId);
    load();
  }

  if (ready === null) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-brand-ink/60">Loading…</div>;
  if (!ready) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-brand-ink/60">Please log in.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-brand-ink">My Jobs</h1>
        <Link href="/post-job" className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-5 py-2.5 text-sm font-bold text-white shadow-glow">
          + Post a job
        </Link>
      </div>

      {/* Bookings */}
      {bookings.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-extrabold text-brand-ink">Your bookings</h2>
          <div className="mt-4 space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <img src={b.painter_profiles?.photo || "https://i.pravatar.cc/100"} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-brand-ink">{b.jobs?.title ?? "Job"}</p>
                    <p className="text-sm text-brand-ink/60">
                      {b.painter_profiles?.name} · ₹{(b.amount ?? 0).toLocaleString("en-IN")}
                      {b.painter_profiles?.phone ? ` · 📞 ${b.painter_profiles.phone}` : ""}
                    </p>
                  </div>
                </div>
                <BookingBadge status={b.status} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Jobs + quotes */}
      <h2 className="mt-8 text-xl font-extrabold text-brand-ink">Posted jobs</h2>
      <div className="mt-4 space-y-4">
        {jobs.length === 0 && (
          <p className="rounded-xl2 border border-orange-100 bg-white p-8 text-center text-brand-ink/60">
            You haven't posted any jobs yet.
          </p>
        )}
        {jobs.map((job) => (
          <div key={job.id} className="rounded-xl2 border border-orange-100 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-brand-ink">{job.title}</h3>
                <p className="text-sm text-brand-ink/60">📍 {job.area ? `${job.area}, ` : ""}{job.city} · ₹{(job.budget ?? 0).toLocaleString("en-IN")}</p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-brand-coral">
                {STATUS_LABEL[job.status] ?? job.status}
              </span>
            </div>

            {/* Quotes */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-brand-ink/70">
                {(job.quotes?.length ?? 0)} quote{(job.quotes?.length ?? 0) !== 1 && "s"}
              </p>
              {(job.quotes ?? []).map((q: any) => (
                <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-orange-50 p-3">
                  <div className="flex items-center gap-3">
                    <img src={q.painter_profiles?.photo || "https://i.pravatar.cc/100"} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <Link href={`/painters/${q.painter_profiles?.id}`} className="font-bold text-brand-ink hover:text-brand-coral">
                        {q.painter_profiles?.name}
                      </Link>
                      <p className="text-sm text-brand-ink/60">
                        ⭐ {Number(q.painter_profiles?.rating_avg ?? 0).toFixed(1)} · ₹{(q.amount ?? 0).toLocaleString("en-IN")}
                        {q.message ? ` · "${q.message}"` : ""}
                      </p>
                    </div>
                  </div>
                  {q.status === "accepted" ? (
                    <span className="rounded-full bg-brand-teal px-3 py-1.5 text-xs font-bold text-white">✓ Accepted</span>
                  ) : q.status === "rejected" ? (
                    <span className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-bold text-gray-500">Declined</span>
                  ) : job.status === "open" ? (
                    <button
                      onClick={() => onAccept(q, job.id)}
                      className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-5 py-1.5 text-xs font-bold text-white shadow-glow"
                    >
                      Accept
                    </button>
                  ) : null}
                </div>
              ))}
              {(job.quotes?.length ?? 0) === 0 && (
                <p className="text-sm text-brand-ink/40">No quotes yet — painters will send offers soon.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    scheduled: ["bg-blue-100 text-blue-700", "● Scheduled"],
    in_progress: ["bg-amber-100 text-amber-700", "● In progress"],
    completed: ["bg-green-100 text-green-700", "✓ Completed"],
    cancelled: ["bg-gray-200 text-gray-500", "Cancelled"],
  };
  const [cls, label] = map[status] ?? ["bg-gray-100 text-gray-600", status];
  return <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${cls}`}>{label}</span>;
}
