// BrushBuddy — ENTITLEMENTS (pure logic; safe on server & client).
// These functions never trust the client by themselves — they are called from
// server route guards (see lib/account.ts + middleware) AND from the UI.

import {
  Plan,
  PLAN_RANK,
  PLAN_LIMITS,
  LimitKey,
  getModule,
} from "./modules";

// What a loaded account looks like for entitlement checks.
export type AccountEntitlements = {
  plan: Plan;                       // the stored plan
  planExpiresAt?: string | null;    // ISO; for founding / trial expiry
  founding?: boolean;               // Family-Perks founding member
  // module ids explicitly granted via add-on or perk (beyond the plan)
  extraModuleIds?: string[];
  // module ids the user toggled OFF (optional modules they don't want)
  disabledModuleIds?: string[];
};

// Founding accounts resolve to Premium until they expire, then Free.
export function effectivePlan(acc: AccountEntitlements, now = new Date()): Plan {
  if (acc.founding) {
    const live = !acc.planExpiresAt || new Date(acc.planExpiresAt) > now;
    return live ? "premium" : "free";
  }
  // a normal plan can also expire (downgrade to free), keeping data.
  if (acc.planExpiresAt && new Date(acc.planExpiresAt) <= now) return "free";
  return acc.plan;
}

// Is this account entitled to a module right now?
export function isEntitled(
  acc: AccountEntitlements,
  moduleId: string,
  now = new Date()
): boolean {
  const mod = getModule(moduleId);
  if (!mod) return false;

  // explicit add-on / perk grant wins (unless user disabled an optional one)
  if (acc.extraModuleIds?.includes(moduleId)) {
    return !acc.disabledModuleIds?.includes(moduleId);
  }

  const plan = effectivePlan(acc, now);
  const planOk = PLAN_RANK[plan] >= PLAN_RANK[mod.minPlan];
  if (!planOk) return false;

  // optional modules can be turned off by the user
  if (mod.optional && acc.disabledModuleIds?.includes(moduleId)) return false;
  return true;
}

// Why a module is shown the way it is, for the Settings → Modules cards.
export type ModuleState =
  | { status: "included"; optional: boolean; enabled: boolean }
  | { status: "addon"; priceMonthly: number }
  | { status: "locked"; needsPlan: Plan };

export function moduleState(acc: AccountEntitlements, moduleId: string): ModuleState {
  const mod = getModule(moduleId)!;
  const plan = effectivePlan(acc);

  if (isEntitled(acc, moduleId)) {
    return {
      status: "included",
      optional: !!mod.optional,
      enabled: !acc.disabledModuleIds?.includes(moduleId),
    };
  }
  // below plan but purchasable as an add-on
  if (mod.addOnPriceMonthly && PLAN_RANK[plan] < PLAN_RANK[mod.minPlan]) {
    return { status: "addon", priceMonthly: mod.addOnPriceMonthly };
  }
  return { status: "locked", needsPlan: mod.minPlan };
}

// Quota check. usage = current count; returns whether one more is allowed.
export function withinLimit(
  acc: AccountEntitlements,
  key: LimitKey,
  currentUsage: number
): boolean {
  const plan = effectivePlan(acc);
  const max = PLAN_LIMITS[plan][key];
  if (max === -1) return true; // unlimited
  return currentUsage < max;
}

export function limitFor(acc: AccountEntitlements, key: LimitKey): number {
  return PLAN_LIMITS[effectivePlan(acc)][key];
}
