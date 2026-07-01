"use client";

import { FormEvent, useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import type { RideWithClub } from "@/lib/types";

export function RideCancelDialog({ ride }: { ride: RideWithClub }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = new FormData(event.currentTarget);
    const actorId = window.localStorage.getItem("katnut_user_id") ?? "00000000-0000-4000-8000-000000000001";
    const response = await fetch(`/api/rides/${ride.id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor_user_id: actorId,
        cancellation_reason: String(form.get("cancellation_reason") || "")
      })
    });
    const result = await response.json().catch(() => ({}));
    setState(response.ok ? "success" : "error");
    setMessage(response.ok ? "Заезд отменен, участники получили внутреннее уведомление." : result.error ?? "Не удалось отменить");
  }

  return (
    <form id="cancel" onSubmit={submit} className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <div className="flex items-center gap-2">
        <XCircle size={18} />
        <h2 className="text-base font-black">Отмена заезда</h2>
      </div>
      <label className="mt-3 block text-sm font-bold" htmlFor="cancellation_reason">
        Причина отмены
        <textarea
          id="cancellation_reason"
          name="cancellation_reason"
          rows={3}
          minLength={3}
          required
          defaultValue={ride.cancellation_reason ?? ""}
          className="mt-2 w-full rounded-lg border border-rose-200 bg-white p-3 text-base outline-none focus:border-rose-400"
        />
      </label>
      <button
        type="submit"
        disabled={state === "loading" || ride.status === "cancelled"}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-rose-600 text-sm font-bold text-white disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="animate-spin" size={17} /> : <XCircle size={17} />}
        {ride.status === "cancelled" ? "Уже отменен" : "Отменить заезд"}
      </button>
      {message && <p className="mt-2 text-sm font-semibold">{message}</p>}
    </form>
  );
}
