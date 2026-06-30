"use client";

import { useState } from "react";
import { Copy, Send } from "lucide-react";
import { rideShareText } from "@/lib/format";
import { hapticFeedback } from "@/lib/telegram/webapp";
import type { RideWithClub } from "@/lib/types";

export function ShareRideButton({ ride }: { ride: RideWithClub }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = rideShareText(ride, window.location.origin);
    if (navigator.share) {
      await navigator.share({ title: ride.title, text, url: `${window.location.origin}/rides/${ride.id}` });
      hapticFeedback("success");
      return;
    }

    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    hapticFeedback("success");
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-app-stroke bg-app-card text-sm font-bold"
    >
      {copied ? <Copy size={17} /> : <Send size={17} />}
      {copied ? "Текст скопирован" : "Поделиться заездом"}
    </button>
  );
}
