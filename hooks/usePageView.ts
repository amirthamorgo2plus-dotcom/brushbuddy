"use client";

import { useEffect } from "react";

// Fire-and-forget page-view ping. Errors are swallowed so tracking never
// affects the page.
export function usePageView(path: string) {
  useEffect(() => {
    if (!path) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);
}
