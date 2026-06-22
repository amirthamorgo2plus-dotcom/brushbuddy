"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { signOut } from "@/lib/auth";

const baseLinks = [
  { href: "/plans", label: "Care Plans" },
  { href: "/painters", label: "Find Pros" },
  { href: "/jobs", label: "Open Jobs" },
  { href: "/post-job", label: "Post a Job" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    async function loadRole(uid: string | undefined) {
      if (!uid || !supabase) { setRole(null); return; }
      const { data } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
      setRole(data?.role ?? "customer");
    }

    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      loadRole(data.session?.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
      loadRole(session?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Add a personal link based on who's logged in.
  const links = [...baseLinks];
  if (email) {
    if (role === "painter") links.push({ href: "/my-work", label: "My Work" });
    else links.push({ href: "/my-jobs", label: "My Jobs" });
    if (role === "admin") links.push({ href: "/admin", label: "Admin" });
  } else {
    links.push({ href: "/dashboard", label: "Join as a Pro" });
  }

  async function handleLogout() {
    await signOut();
    setEmail(null);
    setRole(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-orange-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <img src="/brushbuddy-logo.png" alt="BrushBuddy" className="h-9 w-auto" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                path.startsWith(l.href)
                  ? "bg-orange-100 text-brand-coral"
                  : "text-brand-ink/70 hover:bg-orange-50 hover:text-brand-coral"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {email ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-semibold text-brand-ink/70 sm:inline">
              👋 {email.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full border-2 border-brand-coral px-4 py-2 text-sm font-bold text-brand-coral transition hover:bg-orange-50"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-gradient-to-r from-brand-coral to-brand-violet px-5 py-2 text-sm font-bold text-white shadow-glow transition hover:opacity-90"
          >
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
