"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-runs the dashboard's server queries so new bookings appear without a manual reload. */
export default function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds]);
  return null;
}
