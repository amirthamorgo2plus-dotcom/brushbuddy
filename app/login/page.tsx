"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpPassword, signInPassword, ensureProfile, Role } from "@/lib/auth";
import { isSupabaseReady } from "@/lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isSupabaseReady) {
      router.push(role === "painter" ? "/dashboard" : "/painters");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { user, needsConfirm } = await signUpPassword(email, password, role);
        if (needsConfirm) {
          setInfo("Almost there! Please check your email and confirm, then log in.");
          setMode("login");
          return;
        }
        if (user) await ensureProfile(user, role);
        router.push(role === "painter" ? "/onboarding" : "/painters");
      } else {
        const user = await signInPassword(email, password);
        if (user) await ensureProfile(user, role);
        const goPainter = (user?.user_metadata?.role ?? role) === "painter";
        router.push(goPainter ? "/dashboard" : "/painters");
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-coral to-brand-violet text-3xl shadow-glow">
        🎨
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-brand-ink">
        {mode === "login" ? "Welcome back!" : "Join BrushBuddy"}
      </h1>
      <p className="text-brand-ink/60">
        {mode === "login" ? "Log in to continue." : "Create your free account."}
      </p>

      <div className="mt-6 w-full rounded-xl2 border border-orange-100 bg-white p-6 shadow-soft">
        {/* Login / Sign up switch */}
        <div className="grid grid-cols-2 gap-2 rounded-full bg-orange-50 p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); setInfo(""); }}
              className={`rounded-full py-2 text-sm font-bold transition ${
                mode === m ? "bg-white text-brand-coral shadow" : "text-brand-ink/50"
              }`}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-brand-ink/70">I am a...</label>
              <div className="grid grid-cols-2 gap-2 rounded-full bg-orange-50 p-1">
                {(["customer", "painter"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-full py-2 text-sm font-bold capitalize transition ${
                      role === r ? "bg-white text-brand-coral shadow" : "text-brand-ink/50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-ink/70">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-brand-coral"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-ink/70">Password</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-orange-100 px-4 py-3 outline-none focus:border-brand-coral"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-brand-teal">{info}</p>}

          <button
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-r from-brand-coral to-brand-violet py-3 font-bold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>

      {!isSupabaseReady && (
        <p className="mt-4 text-center text-xs text-amber-600">
          Demo mode — Supabase not connected, login is skipped.
        </p>
      )}
      <p className="mt-4 text-center text-xs text-brand-ink/50">
        By continuing you agree to our friendly terms. We keep your details safe.
      </p>
    </div>
  );
}
