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
