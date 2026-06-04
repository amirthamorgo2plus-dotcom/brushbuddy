"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jobs as sampleJobs } from "@/lib/data";
import { Job } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { sendQuote } from "@/lib/bookings";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLive(true);
          setJobs(
            data.map((j: any) => ({
              id: j.id,
              title: j.title,
              type: j.type,
              city: j.city,
              area: j.area,
              budget: j.budget ?? 0,
              details: j.details,
              postedBy: "Customer",
              postedAt: (j.created_at ?? "").slice(0, 10),
              status: j.status,
            }))
          );
        }
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-extrabold text-brand-ink">Open Jobs</h1>
        {live && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">● Live</span>}
      </div>
      <p className="mt-1 text-brand-ink/60">
        Painters — here are jobs waiting for you. Send a quote to win the work.
      </p>

      <div className="mt-6 space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} canQuote={live} />
        ))}
      </div>

      <div className="mt-8 rounded-xl2 bg-gradient-to-r from-brand-teal/10 to-brand-sky/10 p-6 text-center">
        <p className="font-bold text-brand-ink">Need work done instead?</p>
        <Link href="/post-job" className="mt-2 inline-block font-bold text-brand-coral hover:underline">
          Post your own job →
        </Link>
      </div>
    </div>
  );
}

function JobCard({ job, canQuote }: { job: Job; canQuote: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) { setSent(true); return; }
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) { router.push("/login"); return; }
    setBusy(true);
    try {
      await sendQuote(job.id, Number(amount), message);
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Could not send quote.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft transition hover:shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-brand-ink">{job.title}</h3>
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-brand-coral">{job.type}</span>
          </div>
          <p className="mt-1 text-sm text-brand-ink/60">
            📍 {job.city} · {job.area} · Posted {job.postedAt}
          </p>
          <p className="mt-3 text-brand-ink/80">{job.details}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-brand-ink/50">Budget</div>
          <div className="text-2xl font-extrabold text-brand-ink">₹{job.budget.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">● Open</span>
        {!sent ? (
          <button
            onClick={() => (canQuote ? setOpen((o) => !o) : router.push("/login"))}
            className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90"
          >
            {open ? "Cancel" : "Send Quote"}
          </button>
        ) : (
          <span className="rounded-full bg-brand-teal px-4 py-2 text-sm font-bold text-white">✓ Quote sent</span>
        )}
      </div>

      {open && !sent && (
        <form onSubmit={submit} className="mt-4 rounded-xl bg-orange-50 p-4">
          <div className="flex flex-wrap gap-3">
            <input
              required
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Your price ₹"
              className="w-36 rounded-xl border border-orange-100 px-3 py-2 outline-none focus:border-brand-coral"
            />
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Short message (e.g. I can start Monday)"
              className="min-w-[200px] flex-1 rounded-xl border border-orange-100 px-3 py-2 outline-none focus:border-brand-coral"
            />
            <button
              disabled={busy}
              className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-6 py-2 font-bold text-white shadow-glow disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </form>
      )}
    </div>
  );
}
