# 🎨 BrushBuddy

A friendly platform to **find painters, read real reviews, and book work** — like a "RedTaxi for painters". Built with Next.js + Tailwind, ready to plug into Supabase.

> Mobile app is planned for later. This is the full **web** platform.

## What's inside

| Page | What it does |
|------|--------------|
| `/` | Colorful home — how it works, top painters |
| `/painters` | Browse + search + filter painters |
| `/painters/[id]` | Painter profile, work photos, reviews, leave a review, booking box |
| `/post-job` | Customer posts a job (free) |
| `/jobs` | Painters see open jobs and send quotes |
| `/dashboard` | Painter dashboard — stats, requests, reviews, profile |
| `/login` | Phone + OTP login (customer or painter) |
| `/admin` | Verify painters, moderate reviews |

## Run it (no setup needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it works right away with friendly **sample data**.

## Connect Supabase (when ready)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.local.example` to `.env.local` and paste your project URL + anon key.
4. Restart `npm run dev`. The app will start reading live data.

## Tech (free to start, scales later)

- **Next.js + Tailwind** on Vercel (free)
- **Supabase** — database, auth, file storage (free tier)
- **Razorpay** — payments (pay only per transaction) — *add in Stage 2*

## Build stages

1. ✅ **This** — full web app with sample data
2. Connect Supabase (auth, real data, photo uploads)
3. Payments + escrow + notifications
4. Mobile app (Expo) — later
5. Scale: maps, painter bidding, multi-city

## Colors

Warm & friendly: coral `#FF7A59`, violet `#8B5CF6`, teal `#00C2A8`, sunny `#FFC542`.
