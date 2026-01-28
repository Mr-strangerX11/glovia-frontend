"use client";

import { useEffect, useState } from "react";

const ANNOUNCEMENT_KEY = "announcement.dismissed";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const val = typeof window !== "undefined" ? localStorage.getItem(ANNOUNCEMENT_KEY) : null;
    setDismissed(val === "1");
  }, []);

  const handleClose = () => {
    setDismissed(true);
    try {
      localStorage.setItem(ANNOUNCEMENT_KEY, "1");
    } catch {}
  };

  if (dismissed) return null;

  return (
    <div className="w-full bg-primary-600 text-white">
      <div className="container py-2 text-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true">🚚</span>
          <p className="leading-none">
            <span className="font-semibold">Express Delivery:</span> We can deliver your order within 60 minutes, depending on your location.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={handleClose}
          className="inline-flex items-center justify-center rounded-md/80 hover:bg-white/10 transition-colors p-1"
        >
          <span aria-hidden="true" className="text-base leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
