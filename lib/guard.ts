// Server-side entitlement guard for API routes. Client UI may hide/lock a
// module for UX, but every gated API must call assertEntitled() so a crafted
// request can't bypass the plan. Returns the account or throws a 403-style error.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "./supabaseAdmin";
import { isEntitled, withinLimit, AccountEntitlements } from "./entitlements";
import { LimitKey } from "./modules";

export type GuardResult =
  | { ok: true; userId: string; accountId: string; ent: AccountEntitlements }
  | { ok: false; response: NextResponse };

// Reads the caller's Supabase JWT (Authorization: Bearer <token>), loads their
// account + module overrides, and checks the module.
export async function requireModule(req: NextRequest, moduleId: string): Promise<GuardResult> {
  if (!supabaseAdmin) {
    return { ok: false, response: NextResponse.json({ error: "not configured" }, { status: 503 }) };
  }
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }) };
  }

  const { data: u } = await supabaseAdmin.auth.getUser(token);
  const userId = u.user?.id;
  if (!userId) {
    return { ok: false, response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }) };
  }

  const { data: acc } = await supabaseAdmin
    .from("accounts")
    .select("id, plan, plan_expires_at, founding")
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (!acc) {
    return { ok: false, response: NextResponse.json({ error: "no account" }, { status: 403 }) };
  }

  const { data: mods } = await supabaseAdmin
    .from("account_modules")
    .select("module_id, enabled, source")
    .eq("account_id", acc.id);

  const ent: AccountEntitlements = {
    plan: acc.plan,
    planExpiresAt: acc.plan_expires_at,
    founding: acc.founding,
    extraModuleIds: (mods ?? []).filter((m) => m.enabled && m.source !== "plan").map((m) => m.module_id),
    disabledModuleIds: (mods ?? []).filter((m) => !m.enabled).map((m) => m.module_id),
  };

  if (!isEntitled(ent, moduleId)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "upgrade_required", module: moduleId }, { status: 403 }),
    };
  }

  return { ok: true, userId, accountId: acc.id, ent };
}

// Optional quota check for a guarded route.
export function assertWithinLimit(ent: AccountEntitlements, key: LimitKey, currentUsage: number): NextResponse | null {
  if (!withinLimit(ent, key, currentUsage)) {
    return NextResponse.json({ error: "limit_reached", key }, { status: 403 });
  }
  return null;
}
