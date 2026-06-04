import Link from "next/link";
import { getPainter, getReviewsFor } from "@/lib/data";
import StarRating from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";

// Demo: shows painter "Ravi Kumar" (p1) as the logged-in painter.
export default function Dashboard() {
  const me = getPainter("p1")!;
  const myReviews = getReviewsFor(me.id);

  const cards = [
    { icon: "💼", label: "Jobs done", value: me.jobsDone, color: "from-brand-coral to-brand-peach" },
    { icon: "⭐", label: "Rating", value: me.rating.toFixed(1), color: "from-brand-sunny to-brand-coral" },
    { icon: "💬", label: "Reviews", value: me.reviewCount, color: "from-brand-violet to-brand-sky" },
    { icon: "👀", label: "New requests", value: 3, color: "from-brand-teal to-brand-sky" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Welcome */}
      <div className="rounded-xl2 bg-gradient-to-r from-brand-coral to-brand-violet p-6 text-white shadow-glow">
        <div className="flex items-center gap-4">
          <img src={me.photo} alt={me.name} className="h-16 w-16 rounded-full border-4 border-white object-cover" />
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">Hi {me.name.split(" ")[0]}! 👋</h1>
            <p className="text-white/90">Here is how you are doing.</p>
          </div>
          <Link
            href="/onboarding"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-coral transition hover:bg-orange-50"
          >
            Edit my profile
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl2 border border-orange-100 bg-white p-5 shadow-soft">
            <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-xl`}>
              {c.icon}
            </div>
            <div className="mt-3 text-2xl font-extrabold text-brand-ink">{c.value}</div>
            <div className="text-sm text-brand-ink/60">{c.label}</div>
          </div>
        ))}
      </div>

      {/* New job requests */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-brand-ink">New job requests</h2>
            <Link href="/jobs" className="text-sm font-bold text-brand-coral hover:underline">
              See all jobs →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { name: "Meena", work: "2 BHK interior", city: "Bengaluru", budget: 18000 },
              { name: "Arjun", work: "Texture wall", city: "Bengaluru", budget: 9000 },
              { name: "Fatima", work: "Wood polish doors", city: "Bengaluru", budget: 6000 },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl2 border border-orange-100 bg-white p-4 shadow-soft">
                <div>
                  <p className="font-bold text-brand-ink">{r.work}</p>
                  <p className="text-sm text-brand-ink/60">{r.name} · 📍 {r.city} · ₹{r.budget.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-4 py-2 text-sm font-bold text-white">
                    Quote
                  </button>
                  <button className="rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-brand-ink/60">
                    Skip
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* My reviews */}
          <h2 className="mt-8 text-xl font-extrabold text-brand-ink">What people say about me</h2>
          <div className="mt-4 space-y-4">
            {myReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div className="lg:col-span-1">
          <div className="rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
            <h3 className="font-bold text-brand-ink">Your profile</h3>
            <div className="mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-brand-ink/60">Complete</span>
                <span className="font-bold text-brand-teal">85%</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-orange-100">
                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-brand-coral to-brand-teal" />
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-brand-ink/70">✓ Photo added</li>
              <li className="text-brand-ink/70">✓ Skills added</li>
              <li className="text-brand-ink/70">✓ Verified</li>
              <li className="text-brand-coral">○ Add 2 more work photos</li>
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-sm">
              <StarRating value={me.rating} size="sm" />
              <span className="text-brand-ink/70">Great rating — keep it up!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
