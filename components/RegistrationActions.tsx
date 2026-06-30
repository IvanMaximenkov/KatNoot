"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, Loader2, XCircle } from "lucide-react";
import { hapticFeedback } from "@/lib/telegram/webapp";
import type { RegistrationStatus, RideDetail } from "@/lib/types";

export function RegistrationActions({ ride }: { ride: RideDetail }) {
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<RegistrationStatus | null>(null);
  const [count, setCount] = useState(ride.participant_count);

  async function register(nextStatus: RegistrationStatus) {
    setLoadingStatus(nextStatus);
    const userId =
      window.localStorage.getItem("katnut_user_id") ??
      "00000000-0000-4000-8000-000000000001";

    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ride_id: ride.id,
        user_id: userId,
        status: nextStatus
      })
    });

    if (!response.ok) {
      setLoadingStatus(null);
      hapticFeedback("error");
      return;
    }

    const payload = await response.json();
    setStatus(nextStatus);
    if (typeof payload.participant_count === "number") {
      setCount(payload.participant_count);
    }
    setLoadingStatus(null);
    hapticFeedback(nextStatus === "cancelled" ? "warning" : "success");
  }

  const buttons = [
    { status: "going" as const, label: "Еду", icon: CheckCircle2 },
    { status: "maybe" as const, label: "Возможно", icon: HelpCircle },
    { status: "cancelled" as const, label: "Отменить участие", icon: XCircle }
  ];

  return (
    <section className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black">Участие</h2>
          <p className="mt-1 text-sm text-app-muted">
            {count}
            {ride.max_participants ? `/${ride.max_participants}` : ""} уже едут
          </p>
        </div>
        {status && (
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
            Статус обновлен
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {buttons.map((button) => {
          const Icon = button.icon;
          const active = status === button.status;
          return (
            <button
              key={button.status}
              type="button"
              disabled={Boolean(loadingStatus)}
              onClick={() => register(button.status)}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-bold ${
                active
                  ? "border-app-accent bg-app-accent text-app-accentText"
                  : "border-app-stroke bg-white text-app-text"
              }`}
            >
              {loadingStatus === button.status ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Icon size={18} />
              )}
              {button.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
