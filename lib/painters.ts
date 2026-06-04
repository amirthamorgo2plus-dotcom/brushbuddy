"use client";

import { supabase } from "./supabaseClient";
import { Painter, Review } from "./types";

// Turn a database row (painter_profiles + photos) into a Painter.
export function mapPainter(row: any): Painter {
  return {
    id: row.id,
    name: row.name ?? "Painter",
    photo: row.photo || "https://i.pravatar.cc/300",
    city: row.city ?? "",
    skills: row.skills ?? [],
    about: row.about ?? "",
    pricePerDay: row.price_per_day ?? 0,
    rating: Number(row.rating_avg ?? 0),
    reviewCount: row.rating_count ?? 0,
    jobsDone: row.jobs_done ?? 0,
    verified: row.verified ?? false,
    portfolio: (row.portfolio_items ?? []).map((p: any) => p.image_url),
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
  };
}

const SELECT = "*, portfolio_items(image_url)";

export async function fetchPainters(): Promise<Painter[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("painter_profiles")
    .select(SELECT)
    .order("rating_avg", { ascending: false });
  if (error || !data) return [];
  return data.map(mapPainter);
}

export async function fetchPainter(id: string): Promise<Painter | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("painter_profiles")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapPainter(data) : null;
}

export async function fetchReviews(painterId: string): Promise<Review[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("painter_id", painterId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({
    id: r.id,
    painterId: r.painter_id,
    customerName: r.customer_name ?? "Customer",
    stars: r.stars,
    quality: r.quality,
    onTime: r.on_time,
    cleanliness: r.cleanliness,
    value: r.value,
    text: r.text,
    photos: r.photos ?? [],
    date: (r.created_at ?? "").slice(0, 10),
    reply: r.reply ?? undefined,
  }));
}
