import Link from "next/link";
import { LIVE_SERVICES, COMING_SOON_SERVICES } from "@/lib/services";

// Live services get a big "Book now" card; the rest sit in a "Coming soon" row.
export default function ServiceGrid() {
  return (
    <div>
      <div className="grid gap-5">
        {LIVE_SERVICES.map((s) => (
          <Link
            key={s.slug}
            href="/book"
            className="group flex flex-col items-center gap-5 rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow sm:flex-row sm:p-8"
          >
            <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${s.gradient} text-4xl shadow-glow`}>
              {s.emoji}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-block rounded-full bg-brand-teal px-3 py-1 text-xs font-bold text-white">
                Now booking
              </span>
              <h3 className="mt-2 text-2xl font-extrabold text-brand-ink">{s.name}</h3>
              <p className="mt-1 text-brand-ink/60">
                {s.tagline}. Pick a free slot and we'll be there.
              </p>
            </div>
            <span className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-7 py-3.5 font-bold text-white shadow-glow transition group-hover:opacity-90">
              Book a slot →
            </span>
          </Link>
        ))}
      </div>

      {COMING_SOON_SERVICES.length > 0 && (
        <>
          <h3 className="mt-10 text-center text-lg font-bold text-brand-ink/70">Coming soon</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {COMING_SOON_SERVICES.map((s) => (
              <div
                key={s.slug}
                className="rounded-xl2 border border-dashed border-orange-200 bg-white/60 p-6 text-center"
              >
                <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.gradient} text-2xl opacity-60`}>
                  {s.emoji}
                </div>
                <h4 className="mt-3 font-bold text-brand-ink/70">{s.name}</h4>
                <p className="mt-1 text-sm text-brand-ink/50">{s.tagline}</p>
                <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
