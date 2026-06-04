import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-orange-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-coral to-brand-violet text-white">
              🎨
            </span>
            BrushBuddy
          </div>
          <p className="mt-3 text-sm text-brand-ink/60">
            Find a painter you will love. Easy, safe and friendly.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-brand-ink">For You</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-ink/60">
            <li><Link href="/painters" className="hover:text-brand-coral">Find Painters</Link></li>
            <li><Link href="/post-job" className="hover:text-brand-coral">Post a Job</Link></li>
            <li><Link href="/login" className="hover:text-brand-coral">Log in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-brand-ink">For Painters</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-ink/60">
            <li><Link href="/dashboard" className="hover:text-brand-coral">My Dashboard</Link></li>
            <li><Link href="/jobs" className="hover:text-brand-coral">Open Jobs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-brand-ink">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-ink/60">
            <li>How it works</li>
            <li>Safe payments</li>
            <li>Contact us</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-orange-100 py-5 text-center text-xs text-brand-ink/50">
        © 2026 BrushBuddy. Made with care.
      </div>
    </footer>
  );
}
