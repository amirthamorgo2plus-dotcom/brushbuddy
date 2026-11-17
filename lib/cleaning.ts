"use client";

// Deep Cleaning slot booking. Slots and capacity live in the database
// (supabase/cleaning_bookings.sql) — keep SLOT_TIMES in sync with its check.

import { supabase, isSupabaseReady } from "./supabaseClient";

export const SLOT_TIMES = [
  { value: "09:00", label: "9:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "15:00", label: "3:00 PM" },
];

export const DAYS_AHEAD = 14; // how many days customers can book into
export const DEFAULT_CAPACITY = 2; // used in sample mode only

export const HOME_SIZES = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK / Villa", "Office / Shop"];

export const BOOKING_STATUSES = ["booked", "confirmed", "done", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export function slotLabel(time: string): string {
  return SLOT_TIMES.find((s) => s.value === time)?.label ?? time;
}

// "YYYY-MM-DD" in the browser's local time (not UTC).
export function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Bookable dates: tomorrow onward.
export function bookableDates(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    out.push(isoDate(x));
  }
  return out;
}

export type Availability = {
  capacity: number;
  booked: Record<string, number>; // key: `${date} ${time}`
};

export const slotKey = (date: string, time: string) => `${date} ${time}`;

export async function fetchAvailability(from: string, to: string): Promise<Availability> {
  if (!isSupabaseReady || !supabase) return { capacity: DEFAULT_CAPACITY, booked: {} };
  const [cap, rows] = await Promise.all([
    supabase.rpc("cleaning_slot_capacity"),
    supabase.rpc("cleaning_slot_availability", { p_from: from, p_to: to }),
  ]);
  if (rows.error) throw rows.error;
  const booked: Record<string, number> = {};
  for (const r of (rows.data ?? []) as { slot_date: string; slot_time: string; booked: number }[]) {
    booked[slotKey(r.slot_date, r.slot_time)] = r.booked;
  }
  return { capacity: (cap.data as number) ?? DEFAULT_CAPACITY, booked };
}

export type CleaningBookingInput = {
  date: string;
  time: string;
  pkg: string;
  homeSize: string;
  city: string;
  area: string;
  address: string;
  contactName: string;
  phone: string;
  notes: string;
};

// Books a slot. Returns the booking id ("" in sample mode).
// Throws Error("SLOT_FULL") if someone took the last spot first.
export async function bookCleaningSlot(b: CleaningBookingInput): Promise<string> {
  if (!isSupabaseReady || !supabase) return "";
  const { data, error } = await supabase.rpc("book_cleaning_slot", {
    p_date: b.date,
    p_time: b.time,
    p_package: b.pkg,
    p_home_size: b.homeSize,
    p_city: b.city,
    p_area: b.area,
    p_address: b.address,
    p_contact_name: b.contactName,
    p_phone: b.phone,
    p_notes: b.notes,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

// ADMIN: every booking from a date onward, soonest first.
export async function fetchCleaningBookings(from: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cleaning_bookings")
    .select("*")
    .gte("slot_date", from)
    .order("slot_date", { ascending: true })
    .order("slot_time", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateCleaningBookingStatus(id: string, status: BookingStatus) {
  if (!supabase) return;
  const { error } = await supabase.from("cleaning_bookings").update({ status }).eq("id", id);
  if (error) throw error;
}
