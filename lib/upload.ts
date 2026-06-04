"use client";

import { supabase } from "./supabaseClient";

// Upload an image to the public "photos" bucket and return its public URL.
export async function uploadImage(file: File, folder = "misc"): Promise<string> {
  if (!supabase) throw new Error("Supabase not connected");
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image is too big (max 5 MB).");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}
