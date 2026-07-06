import type { Metadata } from "next";
import Link from "next/link";
import { painters, reviews } from "@/lib/data";
import { SERVICES } from "@/lib/services";
import PainterCard from "@/components/PainterCard";

const WA = "https://wa.me/918220980134";

export const metadata: Metadata = {
  title: "BrushBuddy — Live Demo (no login)",
  description:
    "Explore the BrushBuddy home-services marketplace with real sample data — browse verified pros, open a profile with reviews, see Care Plans, post a job. No signup needed.",
  openGraph: {
    title: "BrushBuddy — Live Demo",
    description:
      "Try the home-services marketplace right now — trusted local pros, real reviews, fair prices. No login.",
    type: "website",
  },
};

const explore = [
  {
    href: "/painters",
    emoji: "🔍",
    title: "Browse the pros",
    text: "Filter by service, city, area, price & rating. Switch to the map view.",
    cta: "Open the directory",
  },
  {
    href: "/painters/p2",
    emoji: "⭐",
    title: "Open a pro's profile",
    text: "Anjali Sharma (4.9★) — portfolio, verified badge, real reviews & replies.",
    cta: "View a sample profile",
  },
  {
    href: "/plans",
    emoji: "🛡️",
    title: "See Care Plans",
    text: "One yearly plan for the whole space — scheduled visits + protection on covered work.",
    cta: "Explore Care Plans",
  },
  {
    href: "/post-job",
    emoji: "📝",
    title: "Post a job",
    text: "Describe the work and let pros come to you. Try the posting flow.",
    cta: "Try posting a job",
  },
  {
    href: "/jobs",
    emoji: "📋",
    title: "See open jobs",
    text: "This is the pro's side — the live feed of jobs customers have posted.",
    cta: "See the pro's side",
  },
];

export default function DemoPage() {
  const top = [...painters].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const featuredReview = reviews.find((r) => r.painterId === "p1");

  return (
    <div className="bg-gradient-to-b from-orange-50/60 to-white">
      {/* Demo banner */}
      <div className="sticky top-[57px] z-30 border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink/80">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand-teal" />
            You&apos;re exploring a live demo — sample data, no login needed.
          </span>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-4 py-1.5 text-xs font-bold text-white shadow-glow transition hover:opacity-90"
          >
            💬 Get this for my city
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-bold text-brand-coral">
          🖌️ BrushBuddy · Live Demo
        </span>
        <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight text-brand-ink md:text-5xl">
          Explore the whole marketplace —{" "}
          <span className="bg-gradient-to-r from-brand-coral to-brand-violet bg-clip-text text-transparent">
            no login, real sample data
          </span>
          .
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-ink/70">
          BrushBuddy brings painting, deep cleaning, waterproofing & more under one roof — trusted
          local pros, real reviews, fair prices. Everything below is fully clickable. Tap any card
          to explore.
        </p>

        {/* What you can try */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {explore.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group rounded-xl2 border border-orange-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="text-3xl">{e.emoji}</div>
              <h3 className="mt-3 text-lg font-bold text-brand-ink">{e.title}</h3>
              <p className="mt-1 text-sm text-brand-ink/60">{e.text}</p>
              <span className="mt-3 inline-block text-sm font-bold text-brand-coral">
                {e.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-2xl font-extrabold text-brand-ink">All under one roof</h2>
        <p className="mt-1 text-brand-ink/60">Pick a service — it opens the live directory filtered for you.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/painters?service=${s.slug}`}
              className="group rounded-xl2 border border-orange-100 bg-white p-6 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${s.gradient} text-3xl shadow-glow`}>
                {s.emoji}
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand-ink">{s.name}</h3>
              <p className="mt-1 text-sm text-brand-ink/60">{s.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured pros */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-brand-ink">Top rated pros</h2>
          <Link href="/painters" className="font-bold text-brand-coral hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((p) => (
            <PainterCard key={p.id} painter={p} />
          ))}
        </div>
        {featuredReview && (
          <div className="mt-6 rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
            <div className="text-brand-coral">★★★★★</div>
            <p className="mt-2 text-lg font-medium text-brand-ink">“{featuredReview.text}”</p>
            <p className="mt-2 text-sm text-brand-ink/60">— {featuredReview.customerName}, Coimbatore</p>
          </div>
        )}
      </section>

      {/* Two sides */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl2 border border-orange-100 bg-white p-7 shadow-soft">
            <div className="text-3xl">🏠</div>
            <h3 className="mt-3 text-xl font-bold text-brand-ink">For homes & businesses</h3>
            <p className="mt-2 text-brand-ink/70">
              Search pros near you, compare reviews & prices, chat first, then book. Or subscribe to a
              yearly Care Plan and never chase a vendor again.
            </p>
            <Link href="/painters" className="mt-4 inline-block font-bold text-brand-coral hover:underline">
              Find a pro →
            </Link>
          </div>
          <div className="rounded-xl2 border border-orange-100 bg-white p-7 shadow-soft">
            <div className="text-3xl">🧰</div>
            <h3 className="mt-3 text-xl font-bold text-brand-ink">For service pros</h3>
            <p className="mt-2 text-brand-ink/70">
              Join free, get discovered by nearby customers, win jobs from the open feed, and build
              your name with happy reviews.
            </p>
            <Link href="/jobs" className="mt-4 inline-block font-bold text-brand-coral hover:underline">
              See open jobs →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-r from-brand-coral to-brand-violet p-10 text-center text-white shadow-glow">
          <h2 className="text-3xl font-extrabold">Like what you see?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/90">
            We&apos;ll launch BrushBuddy in your city — with your pros and your services. Free to start.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-7 py-3.5 font-bold text-brand-coral transition hover:bg-orange-50"
            >
              💬 Talk to us on WhatsApp
            </a>
            <Link
              href="/"
              className="rounded-full border-2 border-white/70 px-7 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
