"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";
import { isSupabaseReady } from "@/lib/supabaseClient";

export default function ImageUpload({
  value,
  onChange,
  folder = "misc",
  round = false,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  round?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!isSupabaseReady) {
      setError("Connect Supabase to upload photos.");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err: any) {
      setError(err.message ?? "Upload failed. Try again.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {/* Preview */}
        <div
          className={`grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-orange-100 bg-orange-50 ${
            round ? "rounded-full" : "rounded-xl"
          }`}
        >
          {value ? (
            <img src={value} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">🖼️</span>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="rounded-full border-2 border-brand-coral px-4 py-2 text-sm font-bold text-brand-coral transition hover:bg-orange-50 disabled:opacity-60"
          >
            {busy ? "Uploading…" : value ? "📷 Change photo" : "📷 Upload photo"}
          </button>
          <p className="mt-1 text-xs text-brand-ink/40">JPG or PNG, up to 5 MB</p>
        </div>

        <input
          ref={ref}
          type="file"
          accept="image/*"
          onChange={handle}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
