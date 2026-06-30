"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bike, Check, Loader2, Save, UserRound } from "lucide-react";
import { RideCard } from "@/components/RideCard";
import { bikeTypeLabels, levelLabels } from "@/lib/labels";
import { getTelegramUser } from "@/lib/telegram/webapp";
import type { BikeType, CyclingLevel, RideWithClub, User } from "@/lib/types";

const levelOptions = Object.entries(levelLabels) as Array<[CyclingLevel, string]>;
const bikeOptions = Object.entries(bikeTypeLabels) as Array<[BikeType, string]>;

export function ProfileClient({
  user,
  registeredRides,
  createdRides
}: {
  user: User;
  registeredRides: RideWithClub[];
  createdRides: RideWithClub[];
}) {
  const [telegramName, setTelegramName] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const telegramUser = getTelegramUser();
    if (telegramUser) {
      setTelegramName(
        [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ")
      );
    }
  }, []);

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState("saving");
    const formData = new FormData(event.currentTarget);
    const userId = window.localStorage.getItem("katnut_user_id") ?? user.id;

    const payload = {
      cycling_level: String(formData.get("cycling_level")),
      bike_type: String(formData.get("bike_type")),
      preferred_pace_min: Number(formData.get("preferred_pace_min")),
      preferred_pace_max: Number(formData.get("preferred_pace_max"))
    };

    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSaveState(response.ok ? "saved" : "error");
    setTimeout(() => setSaveState("idle"), 1800);
  }

  return (
    <>
      <section className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-app-accent text-app-accentText">
            <UserRound size={30} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
              {telegramName ? "Telegram Mini App" : "Браузерный демо-режим"}
            </p>
            <h1 className="mt-1 text-2xl font-black">{telegramName ?? user.first_name}</h1>
            <p className="mt-1 text-sm text-app-muted">
              @{user.username ?? "demo_rider"} · {levelLabels[user.cycling_level]}
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={savePreferences} className="mt-4 rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-800">
            <Bike size={20} />
          </div>
          <div>
            <h2 className="text-base font-black">Велопредпочтения</h2>
            <p className="text-xs text-app-muted">Помогают подбирать подходящие старты.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <label className="block text-sm font-bold" htmlFor="cycling_level">
            Уровень
            <select
              id="cycling_level"
              name="cycling_level"
              defaultValue={user.cycling_level}
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            >
              {levelOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold" htmlFor="bike_type">
            Велосипед
            <select
              id="bike_type"
              name="bike_type"
              defaultValue={user.bike_type}
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            >
              {bikeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-bold" htmlFor="preferred_pace_min">
              Темп от
              <input
                id="preferred_pace_min"
                name="preferred_pace_min"
                type="number"
                min="5"
                defaultValue={user.preferred_pace_min}
                className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
              />
            </label>
            <label className="block text-sm font-bold" htmlFor="preferred_pace_max">
              Темп до
              <input
                id="preferred_pace_max"
                name="preferred_pace_max"
                type="number"
                min="5"
                defaultValue={user.preferred_pace_max}
                className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saveState === "saving"}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-app-accent text-sm font-bold text-app-accentText disabled:opacity-70"
        >
          {saveState === "saving" && <Loader2 className="animate-spin" size={17} />}
          {saveState === "saved" && <Check size={17} />}
          {saveState === "idle" && <Save size={17} />}
          {saveState === "error" ? "Не сохранилось" : saveState === "saved" ? "Сохранено" : "Сохранить"}
        </button>
      </form>

      <section className="mt-6">
        <h2 className="text-lg font-black">Мои регистрации</h2>
        <div className="mt-3 space-y-3">
          {registeredRides.length > 0 ? (
            registeredRides.map((ride) => <RideCard key={ride.id} ride={ride} compact />)
          ) : (
            <p className="rounded-lg border border-dashed border-app-stroke bg-app-card p-4 text-sm text-app-muted">
              Пока нет записей. Самое время выбрать ближайший заезд.
            </p>
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-black">Созданные заезды</h2>
        <div className="mt-3 space-y-3">
          {createdRides.length > 0 ? (
            createdRides.map((ride) => <RideCard key={ride.id} ride={ride} compact />)
          ) : (
            <p className="rounded-lg border border-dashed border-app-stroke bg-app-card p-4 text-sm text-app-muted">
              Здесь появятся заезды, которые вы создали как организатор.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
