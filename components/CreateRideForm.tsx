"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Loader2, Send } from "lucide-react";
import { bikeTypeLabels, levelLabels, rideTypeLabels } from "@/lib/labels";
import { formatDateInputValue, rideShareText } from "@/lib/format";
import { hapticFeedback } from "@/lib/telegram/webapp";
import type { BikeType, Club, CyclingLevel, RideType, RideWithClub } from "@/lib/types";

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; ride: RideWithClub; shareText: string }
  | { status: "error"; message: string };

const levelOptions = Object.entries(levelLabels) as Array<[CyclingLevel, string]>;
const bikeOptions = Object.entries(bikeTypeLabels) as Array<[BikeType, string]>;
const rideTypeOptions = Object.entries(rideTypeLabels) as Array<[RideType, string]>;

function defaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(19, 30, 0, 0);
  return formatDateInputValue(date.toISOString());
}

export function CreateRideForm({ clubs }: { clubs: Club[] }) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [noDrop, setNoDrop] = useState(true);
  const [createdLinkCopied, setCreatedLinkCopied] = useState(false);
  const appUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL
      : window.location.origin || process.env.NEXT_PUBLIC_APP_URL;

  const firstClub = clubs[0];
  const initialDate = useMemo(() => defaultDate(), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const userId =
      window.localStorage.getItem("katnut_user_id") ??
      "00000000-0000-4000-8000-000000000001";

    const payload = {
      club_id: String(formData.get("club_id") || firstClub?.id),
      creator_user_id: userId,
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      date_time: new Date(String(formData.get("date_time"))).toISOString(),
      start_location_name: String(formData.get("start_location_name") || ""),
      start_lat: Number(formData.get("start_lat")),
      start_lng: Number(formData.get("start_lng")),
      finish_location_name: String(formData.get("finish_location_name") || "") || null,
      finish_lat: String(formData.get("finish_lat") || "") ? Number(formData.get("finish_lat")) : null,
      finish_lng: String(formData.get("finish_lng") || "") ? Number(formData.get("finish_lng")) : null,
      distance_km: Number(formData.get("distance_km")),
      pace_min_kmh: Number(formData.get("pace_min_kmh")),
      pace_max_kmh: Number(formData.get("pace_max_kmh")),
      level: String(formData.get("level")),
      ride_type: String(formData.get("ride_type")),
      bike_type: String(formData.get("bike_type")),
      no_drop: noDrop,
      max_participants: String(formData.get("max_participants") || "")
        ? Number(formData.get("max_participants"))
        : null,
      rules: String(formData.get("rules") || "") || null,
      what_to_bring: String(formData.get("what_to_bring") || "") || null,
      route_url: String(formData.get("route_url") || "") || null,
      telegram_chat_url: String(formData.get("telegram_chat_url") || "") || null
    };

    const response = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      setState({ status: "error", message: result.error ?? "Не удалось создать заезд" });
      hapticFeedback("error");
      return;
    }

    const shareText = rideShareText(result.ride, appUrl);
    setState({ status: "success", ride: result.ride, shareText });
    hapticFeedback("success");
    form.reset();
  }

  async function copyShareText(text: string) {
    await navigator.clipboard?.writeText(text);
    setCreatedLinkCopied(true);
    setTimeout(() => setCreatedLinkCopied(false), 1600);
  }

  if (state.status === "success") {
    return (
      <section className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
          <Check size={24} />
        </div>
        <h1 className="mt-4 text-2xl font-black">Заезд создан</h1>
        <p className="mt-2 text-sm text-app-muted">
          Текст ниже можно отправить в клубный чат или личку участникам.
        </p>
        <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-white">
          {state.shareText}
        </pre>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => copyShareText(state.shareText)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-app-card text-sm font-semibold"
          >
            <Copy size={16} />
            {createdLinkCopied ? "Скопировано" : "Скопировать"}
          </button>
          <Link
            href={`/rides/${state.ride.id}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-app-accent text-sm font-semibold text-app-accentText"
          >
            <ExternalLink size={16} />
            Открыть
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <label className="block text-sm font-bold" htmlFor="title">
          Название
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          placeholder="Например, Коферайд по набережным"
          className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
        />

        <div className="mt-4 grid grid-cols-1 gap-4">
          <label className="block text-sm font-bold" htmlFor="date_time">
            Дата и время
            <input
              id="date_time"
              name="date_time"
              type="datetime-local"
              defaultValue={initialDate}
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>

          <label className="block text-sm font-bold" htmlFor="club_id">
            Клуб
            <select
              id="club_id"
              name="club_id"
              defaultValue={firstClub?.id}
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            >
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold" htmlFor="ride_type">
            Тип заезда
            <select
              id="ride_type"
              name="ride_type"
              defaultValue="coffee"
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            >
              {rideTypeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <h2 className="text-base font-black">Старт</h2>
        <label className="mt-4 block text-sm font-bold" htmlFor="start_location_name">
          Место старта
          <input
            id="start_location_name"
            name="start_location_name"
            required
            defaultValue="Парк Горького, главный вход"
            className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
          />
        </label>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold" htmlFor="start_lat">
            Широта
            <input
              id="start_lat"
              name="start_lat"
              type="number"
              step="0.0001"
              defaultValue="55.7298"
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
          <label className="block text-sm font-bold" htmlFor="start_lng">
            Долгота
            <input
              id="start_lng"
              name="start_lng"
              type="number"
              step="0.0001"
              defaultValue="37.6037"
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <h2 className="text-base font-black">Параметры</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold" htmlFor="distance_km">
            Дистанция, км
            <input
              id="distance_km"
              name="distance_km"
              type="number"
              min="1"
              defaultValue="25"
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
          <label className="block text-sm font-bold" htmlFor="max_participants">
            Лимит
            <input
              id="max_participants"
              name="max_participants"
              type="number"
              min="1"
              defaultValue="16"
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
          <label className="block text-sm font-bold" htmlFor="pace_min_kmh">
            Темп от
            <input
              id="pace_min_kmh"
              name="pace_min_kmh"
              type="number"
              min="5"
              defaultValue="16"
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
          <label className="block text-sm font-bold" htmlFor="pace_max_kmh">
            Темп до
            <input
              id="pace_max_kmh"
              name="pace_max_kmh"
              type="number"
              min="5"
              defaultValue="22"
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <label className="block text-sm font-bold" htmlFor="level">
            Уровень
            <select
              id="level"
              name="level"
              defaultValue="casual"
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
              defaultValue="any"
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            >
              {bikeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-app-stroke p-3 text-sm font-bold">
            No-drop: никого не бросаем
            <input
              type="checkbox"
              checked={noDrop}
              onChange={(event) => setNoDrop(event.target.checked)}
              className="h-5 w-5 accent-[rgb(var(--app-accent))]"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <h2 className="text-base font-black">Описание</h2>
        <label className="mt-4 block text-sm font-bold" htmlFor="description">
          Что будет
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            rows={4}
            placeholder="Маршрут, настроение, кому подойдет."
            className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3 text-base outline-none focus:border-app-accent"
          />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="rules">
          Правила
          <textarea
            id="rules"
            name="rules"
            rows={3}
            placeholder="Шлем, свет, поведение в группе."
            className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3 text-base outline-none focus:border-app-accent"
          />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="what_to_bring">
          Что взять
          <textarea
            id="what_to_bring"
            name="what_to_bring"
            rows={3}
            placeholder="Вода, камера, свет, перекус."
            className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3 text-base outline-none focus:border-app-accent"
          />
        </label>
      </div>

      <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <h2 className="text-base font-black">Ссылки и финиш</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <label className="block text-sm font-bold" htmlFor="route_url">
            Ссылка на маршрут
            <input
              id="route_url"
              name="route_url"
              type="url"
              placeholder="https://..."
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
          <label className="block text-sm font-bold" htmlFor="telegram_chat_url">
            Чат заезда
            <input
              id="telegram_chat_url"
              name="telegram_chat_url"
              type="url"
              placeholder="https://t.me/..."
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
          <label className="block text-sm font-bold" htmlFor="finish_location_name">
            Финиш
            <input
              id="finish_location_name"
              name="finish_location_name"
              placeholder="Можно оставить пустым"
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-bold" htmlFor="finish_lat">
              Финиш широта
              <input
                id="finish_lat"
                name="finish_lat"
                type="number"
                step="0.0001"
                className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
              />
            </label>
            <label className="block text-sm font-bold" htmlFor="finish_lng">
              Финиш долгота
              <input
                id="finish_lng"
                name="finish_lng"
                type="number"
                step="0.0001"
                className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 text-base outline-none focus:border-app-accent"
              />
            </label>
          </div>
        </div>
      </div>

      {state.status === "error" && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.status === "loading"}
        className="sticky bottom-24 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-app-accent text-base font-bold text-app-accentText shadow-soft disabled:opacity-70"
      >
        {state.status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        Создать заезд
      </button>
    </form>
  );
}
