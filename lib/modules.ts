// BrushBuddy — MODULE REGISTRY (single source of truth for plan-gated features).
// Every gateable feature of the app is one module here. Plans, limits and the
// Settings → Modules page all read from this file.

export type Plan = "free" | "starter" | "premium";

export const PLAN_RANK: Record<Plan, number> = { free: 0, starter: 1, premium: 2 };
export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  premium: "Premium",
};

export type ModuleCategory =
  | "Discovery"
  | "Jobs & Bookings"
  | "Care Plans"
  | "Communications"
  | "Business / Institutional"
  | "Marketplace"
  | "Pro Tools"
  | "Analytics & AI";

export type AppModule = {
  id: string;
  name: string;
  description: string;
  icon: string;            // emoji for now
  category: ModuleCategory;
  minPlan: Plan;
  optional?: boolean;      // can be toggled on/off when included
  addOnPriceMonthly?: number; // ₹/month if available as a paid add-on below its plan
};

export const MODULES: AppModule[] = [
  // ---- Discovery (Free hook) ----
  { id: "browse_pros", name: "Find Pros", description: "Search & filter verified local pros.", icon: "🔍", category: "Discovery", minPlan: "free" },
  { id: "map_view", name: "Map View", description: "See pros near you on a map.", icon: "🗺️", category: "Discovery", minPlan: "free" },
  { id: "reviews", name: "Reviews & Ratings", description: "Read and leave reviews with photos.", icon: "⭐", category: "Discovery", minPlan: "free" },

  // ---- Jobs & Bookings ----
  { id: "post_job", name: "Post a Job", description: "Post a job and receive quotes.", icon: "📝", category: "Jobs & Bookings", minPlan: "free" },
  { id: "bookings", name: "Bookings", description: "Accept quotes and manage bookings.", icon: "📅", category: "Jobs & Bookings", minPlan: "free" },
  { id: "photo_uploads", name: "Job Photos", description: "Attach before/after photos to jobs.", icon: "📷", category: "Jobs & Bookings", minPlan: "free" },

  // ---- Care Plans ----
  { id: "care_plan_request", name: "Request a Care Plan", description: "Ask for a yearly custom plan.", icon: "🛡️", category: "Care Plans", minPlan: "free" },
  { id: "my_plan", name: "My Plan Dashboard", description: "View plan status, schedule & claims.", icon: "📋", category: "Care Plans", minPlan: "starter" },
  { id: "plan_scheduler", name: "Auto Scheduler", description: "Planned visits scheduled across the year.", icon: "🗓️", category: "Care Plans", minPlan: "starter" },
  { id: "protection_claims", name: "Protection Claims", description: "Raise free re-do claims under your plan.", icon: "🧰", category: "Care Plans", minPlan: "starter" },
  { id: "brushbuddy_protect", name: "BrushBuddy Protect", description: "Premium warranty: priority + condition report.", icon: "🛡️", category: "Care Plans", minPlan: "premium", addOnPriceMonthly: 299 },

  // ---- Communications ----
  { id: "notifications", name: "WhatsApp & Email Alerts", description: "Visit reminders, quotes, claim updates.", icon: "🔔", category: "Communications", minPlan: "starter" },
  { id: "concierge_chat", name: "BrushBuddy Concierge", description: "AI chat help in Tamil & English.", icon: "💬", category: "Communications", minPlan: "premium", addOnPriceMonthly: 199 },

  // ---- Business / Institutional ----
  { id: "multi_property", name: "Multi-Property", description: "Manage many sites under one account.", icon: "🏢", category: "Business / Institutional", minPlan: "premium", addOnPriceMonthly: 499 },
  { id: "team_seats", name: "Team Seats", description: "Add staff logins with roles.", icon: "👥", category: "Business / Institutional", minPlan: "starter", optional: true },
  { id: "compliance_audits", name: "Compliance Audits", description: "Hygiene/SOP audit reports (hotels, hospitals).", icon: "✅", category: "Business / Institutional", minPlan: "premium" },
  { id: "gst_invoicing", name: "GST Invoicing", description: "GST-compliant invoices & PO support.", icon: "🧾", category: "Business / Institutional", minPlan: "starter" },

  // ---- Marketplace ----
  { id: "supplies_store", name: "Supplies Store", description: "Buy paints & cleaning materials (Xeltrix).", icon: "🛒", category: "Marketplace", minPlan: "starter" },
  { id: "seasonal_packages", name: "Seasonal Packages", description: "Festival & monsoon ready-my-space deals.", icon: "🎁", category: "Marketplace", minPlan: "free" },

  // ---- Pro Tools ----
  { id: "pro_dashboard", name: "Pro Dashboard", description: "Pros manage profile, jobs & earnings.", icon: "👷", category: "Pro Tools", minPlan: "free" },
  { id: "featured_listing", name: "Featured Listing", description: "Boost a pro to the top of search.", icon: "🚀", category: "Pro Tools", minPlan: "starter", addOnPriceMonthly: 299 },
  { id: "pro_financing", name: "Pro Financing & Insurance", description: "Tool BNPL + accident/liability cover.", icon: "🏦", category: "Pro Tools", minPlan: "premium" },

  // ---- Analytics & AI ----
  { id: "basic_analytics", name: "Basic Analytics", description: "Your usage, bookings & spend.", icon: "📊", category: "Analytics & AI", minPlan: "starter" },
  { id: "lead_insights", name: "AI Lead Insights", description: "Power-user & upsell scoring (admin).", icon: "🤖", category: "Analytics & AI", minPlan: "premium" },
  { id: "data_export", name: "Data Export / API", description: "Export records & API access.", icon: "🔌", category: "Analytics & AI", minPlan: "premium", addOnPriceMonthly: 399 },
];

export function getModule(id: string): AppModule | undefined {
  return MODULES.find((m) => m.id === id);
}

// ---- Per-plan LIMITS / quotas ----------------------------------------------
export type LimitKey =
  | "jobs_per_month"
  | "active_care_plans"
  | "team_seats"
  | "properties"
  | "photos_per_job";

// -1 means unlimited.
export const PLAN_LIMITS: Record<Plan, Record<LimitKey, number>> = {
  free:    { jobs_per_month: 3,  active_care_plans: 1,  team_seats: 1,  properties: 1,  photos_per_job: 3  },
  starter: { jobs_per_month: 50, active_care_plans: 5,  team_seats: 3,  properties: 3,  photos_per_job: 20 },
  premium: { jobs_per_month: -1, active_care_plans: -1, team_seats: 10, properties: -1, photos_per_job: 100 },
};

export const LIMIT_LABEL: Record<LimitKey, string> = {
  jobs_per_month: "Jobs / month",
  active_care_plans: "Active care plans",
  team_seats: "Team seats",
  properties: "Properties",
  photos_per_job: "Photos / job",
};

// Plan price (₹/month) shown in the upgrade comparison. Free = 0.
export const PLAN_PRICE_MONTHLY: Record<Plan, number> = {
  free: 0,
  starter: 499,
  premium: 1499,
};
