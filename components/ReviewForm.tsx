"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";

export default function ReviewForm({
  painterName,
  painterId,
  onSubmitted,
}: {
  painterName: string;
  painterId?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [quality, setQuality] = useState(5);
  const [onTime, setOnTime] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [value, setValue] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Demo mode (no Supabase): just say thanks.
    if (!isSupabaseReady || !supabase || !painterId) {
      setDone(true);
      return;
    }

    setBusy(true);
    // Must be logged in to leave a review (RLS needs your user id).
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      router.push("/login");
      return;
    }

    // Get the reviewer's name for display.
    const { data: prof } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", s.session.user.id)
      .maybeSingle();

    const { error: insErr } = await supabase.from("reviews").insert({
      painter_id: painterId,
      customer_id: s.session.user.id,
      customer_name: prof?.name ?? s.session.user.email?.split("@")[0] ?? "Customer",
      stars,
      quality,
      on_time: onTime,
      cleanliness,
      value,
      text,
    });

    setBusy(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setDone(true);
    onSubmitted?.();
  }

  if (done) {
    return (
      <div className="rounded-xl2 border border-brand-teal/30 bg-teal-50 p-6 text-center">
        <div className="text-4xl">🎉</div>
        <p className="mt-2 font-bold text-brand-ink">Thank you for your review!</p>
        <p className="text-sm text-brand-ink/60">It helps other people pick the right painter.</p>
      </div>
    );
  }

  const Row = ({ label, val, set }: { label: string; val: number; set: (v: number) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-brand-ink/70">{label}</span>
      <StarRating value={val} onChange={set} size="sm" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
      <h3 className="text-lg font-bold text-brand-ink">Rate {painterName}</h3>
      <p className="text-sm text-brand-ink/60">Tell others how the work was.</p>

      <div className="mt-4 flex items-center gap-3">
        <span className="font-semibold text-brand-ink">Overall</span>
        <StarRating value={stars} onChange={setStars} size="lg" />
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-orange-50 p-4">
        <Row label="Work quality" val={quality} set={setQuality} />
        <Row label="On time" val={onTime} set={setOnTime} />
        <Row label="Kept it clean" val={cleanliness} set={setCleanliness} />
        <Row label="Worth the price" val={value} set={setValue} />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a few words about your experience..."
        rows={3}
        className="mt-4 w-full rounded-xl border border-orange-100 p-3 text-sm outline-none focus:border-brand-coral"
      />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-full bg-gradient-to-r from-brand-coral to-brand-violet py-3 font-bold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Sending..." : "Send Review"}
      </button>
    </form>
  );
}
