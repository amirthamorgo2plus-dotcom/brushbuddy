import { supabase, isSupabaseReady } from "./supabaseClient";

// BrushBuddy Care Plans — a yearly membership instead of one-off jobs.
// The customer subscribes for a year; we schedule upkeep proactively and
// cover protected fixes. Pricing is a CUSTOM QUOTE per property (homes &
// businesses differ a lot), so the flow is: request -> we quote -> active.

// The three things every Care Plan promises.
export const PLAN_PILLARS = [
  {
    emoji: "🧰",
    title: "All services, one plan",
    text: "Painting, deep cleaning, waterproofing & epoxy — all included under a single yearly membership.",
  },
  {
    emoji: "📅",
    title: "Scheduled, not reactive",
    text: "We come on a planned calendar and keep your space in shape — instead of waiting for something to break.",
  },
  {
    emoji: "🛡️",
    title: "Protection included",
    text: "If covered work fails during the year, we fix it free. One trusted team looks after your whole property.",
  },
];

// Who a plan is for. Homes get simpler plans; businesses are sized per property.
export type PropertyKind =
  | "Home / Apartment"
  | "Villa / Independent house"
  | "Hotel / Resort"
  | "Hospital / Clinic"
  | "School / College"
  | "Office"
  | "Factory / Warehouse"
  | "Shop / Showroom";

export const PROPERTY_KINDS: PropertyKind[] = [
  "Home / Apartment",
  "Villa / Independent house",
  "Hotel / Resort",
  "Hospital / Clinic",
  "School / College",
  "Office",
  "Factory / Warehouse",
  "Shop / Showroom",
];

// A customer's request for a custom yearly plan (before we quote it).
export type PlanRequest = {
  propertyKind: PropertyKind;
  segment: "home" | "business";
  sizeNote: string;        // e.g. "3 BHK", "40-room hotel", "8000 sq ft"
  services: string[];      // service slugs they care about
  city: string;
  area: string;
  contactName: string;
  phone: string;
  notes: string;
};

// Submit a plan request. Supabase-optional, mirrors the post-job flow:
// with no DB connected we just return ok so the happy screen shows.
export async function submitPlanRequest(req: PlanRequest): Promise<void> {
  if (!isSupabaseReady || !supabase) return;

  const { data: s } = await supabase.auth.getSession();
  const { error } = await supabase.from("plan_requests").insert({
    customer_id: s.session?.user.id ?? null,
    property_kind: req.propertyKind,
    segment: req.segment,
    size_note: req.sizeNote,
    services: req.services,
    city: req.city,
    area: req.area,
    contact_name: req.contactName,
    phone: req.phone,
    notes: req.notes,
    status: "requested", // requested -> quoted -> active -> expired
  });
  if (error) throw error;
}

// Businesses get sized per property; homes are simpler. Used to nudge copy.
export function segmentFor(kind: PropertyKind): "home" | "business" {
  return kind === "Home / Apartment" || kind === "Villa / Independent house"
    ? "home"
    : "business";
}

// ---------------------------------------------------------------------------
// ADMIN side: review plan requests and turn them into active care plans.
// ---------------------------------------------------------------------------

// All plan requests, newest first (admin uses service_role / admin role).
export async function fetchPlanRequests() {
  if (!supabase) return [];
  const { data } = await supabase
    .from("plan_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// Quote a request and activate it as a care plan in one step.
// Creates a care_plans row and marks the request "active".
export async function activatePlan(
  request: any,
  quote: { yearlyPrice: number; visitsPerYear: number; startsOn: string }
): Promise<void> {
  if (!supabase) throw new Error("Supabase not connected");

  const start = new Date(quote.startsOn);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const { error: planErr } = await supabase.from("care_plans").insert({
    request_id: request.id,
    customer_id: request.customer_id ?? null,
    title: `${request.property_kind} — Annual Care`,
    services: request.services ?? [],
    yearly_price: quote.yearlyPrice,
    visits_per_year: quote.visitsPerYear,
    starts_on: iso(start),
    ends_on: iso(end),
    status: "active",
  });
  if (planErr) throw planErr;

  const { error: reqErr } = await supabase
    .from("plan_requests")
    .update({ status: "active" })
    .eq("id", request.id);
  if (reqErr) throw reqErr;
}

export async function declinePlanRequest(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("plan_requests").update({ status: "declined" }).eq("id", id);
}

// ---------------------------------------------------------------------------
// MEMBER side: a logged-in customer's own plans, visits and claims.
// ---------------------------------------------------------------------------

// The logged-in customer's care plans, each with its visits and claims.
export async function fetchMyPlans() {
  if (!supabase) return [];
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return [];
  const { data } = await supabase
    .from("care_plans")
    .select("*, plan_visits(*), plan_claims(*)")
    .eq("customer_id", s.session.user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// Member raises a protection claim on one of their plans.
export async function raiseClaim(
  planId: string,
  service: string,
  description: string
): Promise<void> {
  if (!supabase) throw new Error("Supabase not connected");
  const { error } = await supabase.from("plan_claims").insert({
    plan_id: planId,
    service,
    description,
    status: "open",
  });
  if (error) throw error;
}
