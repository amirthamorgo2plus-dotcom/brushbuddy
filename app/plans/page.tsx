import Link from "next/link";
import { PLAN_PILLARS } from "@/lib/plans";
import { SERVICES } from "@/lib/services";

const steps = [
  { icon: "📝", title: "Tell us your property", text: "Home or business — share its size and what you need looked after." },
  { icon: "💬", title: "Get a custom plan", text: "We size it for your property and send a yearly quote — no fixed boxes." },
  { icon: "📅", title: "We take it from here", text: "Scheduled visits all year, plus protection on covered work." },
];

export default function Plans() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-violet-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
          <span className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-coral shadow-soft">
            🛡️ BrushBuddy Care Plans
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-brand-ink md:text-5xl">
            One yearly plan.{" "}
            <span className="bg-gradient-to-r from-brand-coral to-brand-violet bg-clip-text text-transparent">
              Your whole space, cared for.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-ink/70">
            Stop calling around every time something needs work. Subscribe once a year and
            we look after your property — painting, cleaning, waterproofing & more — on a
            planned schedule, with protection built in. For homes and businesses.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/plans/request"
              className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-7 py-3.5 font-bold text-white shadow-glow transition hover:opacity-90"
            >
              Get your custom plan
            </Link>
            <Link
              href="/painters"
              className="rounded-full border-2 border-brand-coral px-7 py-3.5 font-bold text-brand-coral transition hover:bg-orange-50"
            >
              Just need a one-off job?
            </Link>
          </div>
        </div>
      </section>

      {/* The 3 pillars */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {PLAN_PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-xl2 border border-orange-100 bg-white p-7 text-center shadow-soft"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-coral to-brand-violet text-3xl shadow-glow">
                {p.emoji}
              </div>
              <h3 className="mt-4 text-xl font-bold text-brand-ink">{p.title}</h3>
              <p className="mt-2 text-sm text-brand-ink/60">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reactive vs Care plan */}
      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl2 border border-orange-100 bg-white p-7 shadow-soft">
            <div className="text-sm font-bold uppercase tracking-wide text-brand-ink/40">
              The old way
            </div>
            <h3 className="mt-1 text-lg font-bold text-brand-ink">Wait, then repair</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-ink/60">
              <li>❌ Something breaks → scramble to find someone</li>
              <li>❌ A new stranger each time, no accountability</li>
              <li>❌ Small issues grow into costly damage</li>
              <li>❌ Unpredictable bills</li>
            </ul>
          </div>
          <div className="rounded-xl2 border-2 border-brand-coral bg-orange-50/40 p-7 shadow-soft">
            <div className="text-sm font-bold uppercase tracking-wide text-brand-coral">
              With a Care Plan
            </div>
            <h3 className="mt-1 text-lg font-bold text-brand-ink">Prevent, on a schedule</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-ink/70">
              <li>✅ Planned visits before problems start</li>
              <li>✅ One trusted team that knows your property</li>
              <li>✅ Covered fixes done free under protection</li>
              <li>✅ One predictable yearly price</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-3xl font-extrabold text-brand-ink">
          Every service, under one plan
        </h2>
        <p className="mt-2 text-center text-brand-ink/60">
          Mix what your property needs — we build the schedule around it.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div
              key={s.slug}
              className="rounded-xl2 border border-orange-100 bg-white p-6 text-center shadow-soft"
            >
              <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${s.gradient} text-3xl shadow-glow`}>
                {s.emoji}
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand-ink">{s.name}</h3>
              <p className="mt-1 text-sm text-brand-ink/60">{s.tagline}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-6 pb-14">
        <h2 className="text-center text-3xl font-extrabold text-brand-ink">
          How a Care Plan works
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-xl2 border border-orange-100 bg-white p-6 text-center shadow-soft"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-peach to-brand-sky/40 text-3xl">
                {s.icon}
              </div>
              <div className="mt-3 text-sm font-bold text-brand-coral">Step {i + 1}</div>
              <h3 className="mt-1 text-lg font-bold text-brand-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-brand-ink/60">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-r from-brand-coral to-brand-violet p-10 text-center text-white shadow-glow">
          <h2 className="text-3xl font-extrabold">Ready to stop worrying about upkeep?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/90">
            Tell us about your home or business and we'll put together a yearly plan made for it.
          </p>
          <Link
            href="/plans/request"
            className="mt-6 inline-block rounded-full bg-white px-7 py-3.5 font-bold text-brand-coral transition hover:bg-orange-50"
          >
            Get your custom plan
          </Link>
        </div>
      </section>
    </div>
  );
}
