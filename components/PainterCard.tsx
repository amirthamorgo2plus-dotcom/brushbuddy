import Link from "next/link";
import { Painter } from "@/lib/types";
import StarRating from "./StarRating";

export default function PainterCard({ painter }: { painter: Painter }) {
  return (
    <Link
      href={`/painters/${painter.id}`}
      className="group block overflow-hidden rounded-xl2 border border-orange-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative h-36 bg-gradient-to-br from-brand-peach via-orange-100 to-brand-sky/40">
        <img
          src={painter.portfolio[0]}
          alt="work sample"
          className="h-full w-full object-cover opacity-90"
        />
        {painter.verified && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-teal px-3 py-1 text-xs font-bold text-white shadow">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={painter.photo}
            alt={painter.name}
            className="h-12 w-12 rounded-full border-2 border-white object-cover shadow"
          />
          <div>
            <h3 className="font-bold text-brand-ink">{painter.name}</h3>
            <p className="text-xs text-brand-ink/60">
              📍 {painter.area ? `${painter.area}, ` : ""}{painter.city}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StarRating value={painter.rating} size="sm" />
          <span className="text-sm font-semibold text-brand-ink">{painter.rating.toFixed(1)}</span>
          <span className="text-xs text-brand-ink/50">({painter.reviewCount})</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {painter.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-brand-coral"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-brand-ink/60">
            From <span className="font-bold text-brand-ink">₹{painter.pricePerDay}</span>/day
          </span>
          <span className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-4 py-1.5 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
