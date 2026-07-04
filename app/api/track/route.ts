// POST /api/track  { path: string }
// Increments today's view count for a path. Fire-and-forget, no auth.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (typeof path !== "string" || !path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (supabaseAdmin) {
      // atomic insert-or-increment via SQL function (see supabase/page_views.sql)
      await supabaseAdmin.rpc("increment_page_view", { p_path: path });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // never let tracking break a request
    return NextResponse.json({ ok: true });
  }
}
