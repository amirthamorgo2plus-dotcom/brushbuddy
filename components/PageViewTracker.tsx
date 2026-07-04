"use client";

import { usePathname } from "next/navigation";
import { usePageView } from "@/hooks/usePageView";

// Captures every client navigation. Skips admin-only paths.
export default function PageViewTracker() {
  const path = usePathname();
  const skip = path?.startsWith("/admin");
  usePageView(skip ? "" : path);
  return null;
}
