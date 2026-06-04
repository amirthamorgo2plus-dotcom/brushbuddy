"use client";

import { supabase } from "./supabaseClient";

// The painter_profiles.id for the logged-in user (null if they have no profile).
export async function getMyPainterId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return null;
  const { data } = await supabase
    .from("painter_profiles")
    .select("id")
    .eq("user_id", s.session.user.id)
    .maybeSingle();
  return data?.id ?? null;
}

export async function getSessionUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

// PAINTER: send a quote on a job.
export async function sendQuote(jobId: string, amount: number, message: string) {
  if (!supabase) throw new Error("Supabase not connected");
  const painterId = await getMyPainterId();
  if (!painterId) throw new Error("Set up your painter profile first.");
  const { error } = await supabase
    .from("quotes")
    .insert({ job_id: jobId, painter_id: painterId, amount, message });
  if (error) throw error;
}

// PAINTER: my sent quotes (with the job they're for).
export async function fetchMyQuotes() {
  if (!supabase) return [];
  const painterId = await getMyPainterId();
  if (!painterId) return [];
  const { data } = await supabase
    .from("quotes")
    .select("*, jobs(title, type, city, area, status, budget)")
    .eq("painter_id", painterId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// CUSTOMER: my posted jobs, each with the quotes received.
export async function fetchMyJobs() {
  if (!supabase) return [];
  const uid = await getSessionUserId();
  if (!uid) return [];
  const { data } = await supabase
    .from("jobs")
    .select("*, quotes(*, painter_profiles(id, name, phone, photo, rating_avg, area, city))")
    .eq("customer_id", uid)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// CUSTOMER: accept a quote → create a booking, mark job booked, set quote statuses.
export async function acceptQuote(quote: any, jobId: string) {
  if (!supabase) throw new Error("Supabase not connected");
  const uid = await getSessionUserId();
  if (!uid) throw new Error("Please log in.");

  const { error: bErr } = await supabase.from("bookings").insert({
    job_id: jobId,
    painter_id: quote.painter_id,
    customer_id: uid,
    amount: quote.amount,
    status: "scheduled",
  });
  if (bErr) throw bErr;

  await supabase.from("jobs").update({ status: "booked" }).eq("id", jobId);
  await supabase.from("quotes").update({ status: "accepted" }).eq("id", quote.id);
  // mark the other quotes on this job as rejected
  await supabase.from("quotes").update({ status: "rejected" }).eq("job_id", jobId).neq("id", quote.id);
}

// Bookings for the current user (as customer or as painter).
export async function fetchMyBookings() {
  if (!supabase) return { asCustomer: [], asPainter: [] };
  const uid = await getSessionUserId();
  const painterId = await getMyPainterId();

  const sel = "*, jobs(title, type, city, area), painter_profiles(name, phone, photo)";
  const asCustomer = uid
    ? (await supabase.from("bookings").select(sel).eq("customer_id", uid).order("created_at", { ascending: false })).data ?? []
    : [];
  const asPainter = painterId
    ? (await supabase.from("bookings").select(sel).eq("painter_id", painterId).order("created_at", { ascending: false })).data ?? []
    : [];
  return { asCustomer, asPainter };
}

export async function updateBookingStatus(id: string, status: string) {
  if (!supabase) return;
  await supabase.from("bookings").update({ status }).eq("id", id);
}
