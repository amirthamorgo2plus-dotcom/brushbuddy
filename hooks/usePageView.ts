"use client";

import { useEffect } from "react";

// A stable, anonymous per-browser id (no personal data). Lets us count unique
// visitors without accounts or cookies-consent concerns.
function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem("bb_vid");
    if (existing) return existing;
    const id: string =
      (crypto as any)?.randomUUID?.() ??
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("bb_vid", id);
    return id;
  } catch {
    return "";
  }
}

// Fire-and-forget page-view ping. Errors are swallowed so tracking never
// affects the page.
export function usePageView(path: string) {
  useEffect(() => {
    if (!path) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, visitorId: getVisitorId() }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);
}
