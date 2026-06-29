// BrushBuddy — account context: load the current user's account, entitlements
// and usage so the Modules page and route guards can decide access.

import { supabase, isSupabaseReady } from "./supabaseClient";
import { Plan } from "./modules";
import { AccountEntitlements } from "./entitlements";
import { LimitKey } from "./modules";

export type AccountContext = {
  account: {
    id: string | null;
    name: string;
    type: string;
    plan: Plan;
    plan_expires_at: string | null;
    founding: boolean;
  };
  entitlements: AccountEntitlements;
  usage: Record<LimitKey, number>;
};

const DEMO: AccountContext = {
  account: { id: null, name: "Demo account", type: "home", plan: "free", plan_expires_at: null, founding: false },
  entitlements: { plan: "free", planExpiresAt: null, founding: false, extraModuleIds: [], disabledModuleIds: [] },
  usage: { jobs_per_month: 0, active_care_plans: 0, team_seats: 1, properties: 1, photos_per_job: 0 },
};

// Loads everything the Modules page needs. Falls back to a Free demo account.
export async function fetchAccountContext(): Promise<AccountContext> {
  if (!isSupabaseReady || !supabase) return DEMO;

  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id;
  if (!uid) return DEMO;

  // find the user's account (owned or linked); create a personal one if none.
  let { data: acc } = await supabase
    .from("accounts")
    .select("*")
    .or(`owner_user_id.eq.${uid}`)
    .maybeSingle();

  if (!acc) {
    const { data: created } = await supabase
      .from("accounts")
      .insert({ owner_user_id: uid, name: s.session?.user.email?.split("@")[0] ?? "My account" })
      .select("*")
      .maybeSingle();
    acc = created ?? null;
  }
  if (!acc) return DEMO;

  // module overrides (add-ons / perks / disabled toggles)
  const { data: mods } = await supabase
    .from("account_modules")
    .select("module_id, enabled, source")
    .eq("account_id", acc.id);

  const extraModuleIds = (mods ?? [])
    .filter((m) => m.enabled && (m.source === "addon" || m.source === "perk"))
    .map((m) => m.module_id);
  const disabledModuleIds = (mods ?? [])
    .filter((m) => !m.enabled)
    .map((m) => m.module_id);

  // usage counts (best-effort; real queries wired as features are gated)
  const usage = await fetchUsage(acc.id, uid);

  return {
    account: {
      id: acc.id,
      name: acc.name ?? "My account",
      type: acc.type ?? "home",
      plan: (acc.plan ?? "free") as Plan,
      plan_expires_at: acc.plan_expires_at ?? null,
      founding: !!acc.founding,
    },
    entitlements: {
      plan: (acc.plan ?? "free") as Plan,
      planExpiresAt: acc.plan_expires_at ?? null,
      founding: !!acc.founding,
      extraModuleIds,
      disabledModuleIds,
    },
    usage,
  };
}

async function fetchUsage(accountId: string, uid: string): Promise<Record<LimitKey, number>> {
  if (!supabase) return DEMO.usage;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [jobs, plans] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true })
      .eq("customer_id", uid).gte("created_at", monthStart.toISOString()),
    supabase.from("care_plans").select("id", { count: "exact", head: true })
      .eq("customer_id", uid).eq("status", "active"),
  ]);

  return {
    jobs_per_month: jobs.count ?? 0,
    active_care_plans: plans.count ?? 0,
    team_seats: 1,
    properties: 1,
    photos_per_job: 0,
  };
}

// Toggle an optional module on/off for the account (owner only; RLS enforced).
export async function setModuleEnabled(accountId: string, moduleId: string, enabled: boolean) {
  if (!supabase) return;
  await supabase
    .from("account_modules")
    .upsert(
      { account_id: accountId, module_id: moduleId, enabled, source: "plan" },
      { onConflict: "account_id,module_id" }
    );
}
