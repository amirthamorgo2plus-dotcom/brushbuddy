"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPainter, getReviewsFor } from "@/lib/data";
import { fetchPainter, fetchReviews } from "@/lib/painters";
import { getService } from "@/lib/services";
import { Painter, Review } from "@/lib/types";
import StarRating from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";

export default function PainterProfile() {
  const params = useParams();
  const id = String(params.id);

  const [painter, setPainter] = useState<Painter | null | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLive, setIsLive] = useState(false);

  async function loadReviews(live: boolean) {
    setReviews(live ? await fetchReviews(id) : getReviewsFor(id));
  }

  // After a new review, refresh both the list and the painter's rating.
  async function handleReviewed() {
    if (!isLive) return;
    const fresh = await fetchPainter(id);
    if (fresh) setPainter(fresh);
    await loadReviews(true);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Try live data first, then fall back to sample data.
      const live = await fetchPainter(id);
      const p = live ?? getPainter(id) ?? null;
      if (cancelled) return;
      setPainter(p);
      setIsLive(!!live);
      await loadReviews(!!live);
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (painter === undefined) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-brand-ink/60">Loading...</div>;
  }

  if (painter === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="text-5xl">😕</div>
        <p className="mt-3 font-bold text-brand-ink">Painter not found.</p>
        <Link href="/painters" className="mt-2 inline-block font-bold text-brand-coral hover:underline">
          ← Back to painters
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/painters" className="text-sm font-semibold text-brand-coral hover:underline">
        ← Back to painters
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        {/* Left: main info */}
        <div className="lg:col-span-2">
          <div className="rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-4">
              <img src={painter.photo} alt={painter.name} className="h-20 w-20 rounded-full border-4 border-white object-cover shadow" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-brand-ink">{painter.name}</h1>
                  {painter.verified && (
                    <span className="rounded-full bg-brand-teal px-2.5 py-0.5 text-xs font-bold text-white">✓ Verified</span>
                  )}
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-brand-coral">
                    {getService(painter.service)?.emoji} {getService(painter.service)?.name}
                  </span>
                </div>
                <p className="text-brand-ink/60">📍 {painter.city}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={painter.rating} size="sm" />
                  <span className="font-bold text-brand-ink">{painter.rating.toFixed(1)}</span>
                  <span className="text-sm text-brand-ink/50">({painter.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {painter.skills.map((s) => (
                <span key={s} className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-brand-coral">{s}</span>
              ))}
            </div>

            <p className="mt-4 text-brand-ink/80">{painter.about}</p>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Stat big={`${painter.jobsDone}`} small="Jobs done" />
              <Stat big={`${painter.rating.toFixed(1)}★`} small="Rating" />
              <Stat big={`₹${painter.pricePerDay}`} small="Per day" />
            </div>
          </div>

          {/* Portfolio */}
          {painter.portfolio.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-extrabold text-brand-ink">Work photos</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {painter.portfolio.map((src, i) => (
                  <img key={i} src={src} alt="work" className="h-40 w-full rounded-xl object-cover shadow-soft" />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8">
            <h2 className="text-xl font-extrabold text-brand-ink">Reviews ({reviews.length})</h2>
            <div className="mt-4 space-y-4">
              {reviews.length === 0 && (
                <p className="rounded-xl2 border border-orange-100 bg-white p-6 text-center text-brand-ink/60">
                  No reviews yet. Be the first to hire and review!
                </p>
              )}
              {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>

            <div className="mt-6">
              <ReviewForm painterName={painter.name} painterId={painter.id} onSubmitted={handleReviewed} />
            </div>
          </div>
        </div>

        {/* Right: booking box */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
            <p className="text-sm text-brand-ink/60">Starting price</p>
            <p className="text-3xl font-extrabold text-brand-ink">
              ₹{painter.pricePerDay}
              <span className="text-base font-medium text-brand-ink/50">/day</span>
            </p>
            <button className="mt-4 w-full rounded-full bg-gradient-to-r from-brand-coral to-brand-violet py-3 font-bold text-white shadow-glow transition hover:opacity-90">
              Book Now
            </button>
            <button className="mt-2 w-full rounded-full border-2 border-brand-coral py-3 font-bold text-brand-coral transition hover:bg-orange-50">
              💬 Chat first
            </button>
            <div className="mt-5 space-y-2 text-sm text-brand-ink/70">
              <p>✓ Free quote before you pay</p>
              <p>✓ Safe payment, money held till done</p>
              <p>✓ Verified and reviewed painter</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-xl bg-orange-50 py-3">
      <div className="text-lg font-extrabold text-brand-ink">{big}</div>
      <div className="text-xs text-brand-ink/60">{small}</div>
    </div>
  );
}
