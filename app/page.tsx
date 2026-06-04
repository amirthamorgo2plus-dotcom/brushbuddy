import Link from "next/link";
import { painters } from "@/lib/data";
import PainterCard from "@/components/PainterCard";

const steps = [
  { icon: "📝", title: "Tell us your work", text: "Post your job or search painters near you." },
  { icon: "🤝", title: "Pick your painter", text: "Compare reviews, prices and photos. Chat first." },
  { icon: "🎨", title: "Get it painted", text: "Pay safely. Then rate your painter for others." },
];

export default function Home() {
  const top = [...painters].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-bold text-brand-coral">
              ⭐ Trusted painters near you
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-brand-ink md:text-5xl">
              Find a painter you'll{" "}
              <span className="bg-gradient-to-r from-brand-coral to-brand-violet bg-clip-text text-transparent">
                love
              </span>
              .
            </h1>
            <p className="mt-4 text-lg text-brand-ink/70">
              Real reviews. Fair prices. Friendly people. Get your home painted
              the easy way — no stress.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/painters"
                className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-7 py-3.5 font-bold text-white shadow-glow transition hover:opacity-90"
              >
                Find a Painter
              </Link>
              <Link
                href="/post-job"
                className="rounded-full border-2 border-brand-coral px-7 py-3.5 font-bold text-brand-coral transition hover:bg-orange-50"
              >
                Post a Job
              </Link>
            </div>
            <div className="mt-8 flex gap-8">
              {[
                ["500+", "Happy homes"],
                ["4.8★", "Average rating"],
                ["100%", "Verified"],
              ].map(([big, small]) => (
                <div key={small}>
                  <div className="text-2xl font-extrabold text-brand-ink">{big}</div>
                  <div className="text-sm text-brand-ink/60">{small}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-brand-sunny/40 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-brand-teal/30 blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800"
              alt="Painter at work"
              className="relative rounded-xl2 shadow-soft"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-3xl font-extrabold text-brand-ink">
          How it works
        </h2>
        <p className="mt-2 text-center text-brand-ink/60">Three easy steps. That's it.</p>
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

      {/* Top painters */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-brand-ink">Top rated painters</h2>
          <Link href="/painters" className="font-bold text-brand-coral hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((p) => (
            <PainterCard key={p.id} painter={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-r from-brand-coral to-brand-violet p-10 text-center text-white shadow-glow">
          <h2 className="text-3xl font-extrabold">Are you a painter?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/90">
            Join free. Get more work. Build your name with happy reviews.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-block rounded-full bg-white px-7 py-3.5 font-bold text-brand-coral transition hover:bg-orange-50"
          >
            Join as a Painter
          </Link>
        </div>
      </section>
    </div>
  );
}
