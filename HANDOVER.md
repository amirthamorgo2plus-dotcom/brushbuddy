# Handover — BrushBuddy (Painter Marketplace)

> Read `HANDOVER_MASTER.md` (one folder up) first for accounts/billing. This is the technical detail.
> Last updated: 2026-06-04.

## What it is
A painter marketplace web app (RedTaxi-style) — connects customers with painters.

## Tech stack
- **Framework:** Next.js 14 (React 18) + TypeScript + Tailwind v3
- **Backend/DB:** Supabase (`@supabase/supabase-js`)
- Runs on **port 3001** in dev.
- Currently in **sample-data mode** until Supabase is fully wired — meaning some screens use mock
  data rather than the live DB. A developer finishing this connects the Supabase queries.

## Where it's deployed  ⬜ FILL IN
- Hosting: likely **Vercel** + **Supabase**. Record exact URLs/logins in the master doc.

## How to run locally (Windows PowerShell)
```powershell
cd painter-platform
npm install
npm run dev        # http://localhost:3001
```

## Environment variables (`.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL=` your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=` Supabase anon/public key

Get these from: Supabase dashboard → project → Settings → API.

## How to deploy a change
- Push to the connected branch → Vercel auto-builds.
- DB schema lives in `supabase/`.

## Status / TODO
- Finish wiring Supabase (move off sample-data mode).
- Confirm Supabase automated backups are on once real data exists.
