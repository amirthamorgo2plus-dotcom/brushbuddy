"use client";

import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export type Role = "customer" | "painter";

// Create a new account with email + password.
// Returns { user, needsConfirm } — needsConfirm is true if Supabase is set to
// require email confirmation (then no session yet).
export async function signUpPassword(email: string, password: string, role: Role) {
  if (!supabase) throw new Error("Supabase not connected");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role } },
  });
  if (error) throw error;
  return { user: data.user, needsConfirm: !data.session };
}

// Log in to an existing account.
export async function signInPassword(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not connected");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// Make sure this user has a row in `profiles` (created once, on first login).
export async function ensureProfile(user: User, role: Role) {
  if (!supabase) return;
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      role: (user.user_metadata?.role as Role) ?? role,
      name: user.email?.split("@")[0] ?? "Friend",
    });
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

// Is the logged-in user an admin?
export async function isAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", s.session.user.id)
    .maybeSingle();
  return data?.role === "admin";
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
