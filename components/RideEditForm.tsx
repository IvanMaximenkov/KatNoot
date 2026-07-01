"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Save } from "lucide-react";
import { RideCancelDialog } from "@/components/RideCancelDialog";
import { bikeTypeLabels, levelLabels, rideTypeLabels } from "@/lib/labels";
import { formatDateInputValue } from "@/lib/format";
import type { BikeType, CyclingLevel, RideType, RideWithClub } from "@/lib/types";

const levelOptions = Object.entries(levelLabels) as Array<[CyclingLevel, string]>;
const bikeOptions = Object.entries(bikeTypeLabels) as Array<[BikeType, string]>;
const rideTypeOptions = Object.entries(rideTypeLabels) as Array<[RideType, string]>;

export function RideEditForm({ ride }: { ride: RideWithClub }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const form = new FormData(event.currentTarget);
    const actorId = window.localStorage.getItem("katnut_user_id") ?? "00000000-0000-4000-8000-000000000001";
    const payload = {
      actor_user_id: actorId,
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      date_time: new Date(String(form.get("date_time"))).toISOString(),
      start_location_name: String(form.get("start_location_name") || ""),
      start_lat: Number(form.get("start_lat")),
      start_lng: Number(form.get("start_lng")),
      distance_km: Number(form.get("distance_km")),
      pace_min_kmh: Number(form.get("pace_min_kmh")),
      pace_max_kmh: Number(form.get("pace_max_kmh")),
      level: String(form.get("level")),
      ride_type: String(form.get("ride_type")),
      bike_type: String(form.get("bike_type")),
      max_participants: String(form.get("max_participants") || "")
        ? Number(form.get("max_participants"))
        : null,
      rules: String(form.get("rules") || "") || null,
      what_to_bring: String(form.get("what_to_bring") || "") || null,
      route_url: String(form.get("route_url") || "") || null,
      telegram_chat_url: String(form.get("telegram_chat_url") || "") || null,
      status: String(form.get("status"))
    };

    const response = await fetch(`/api/rides/${ride.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    setState(response.ok ? "saved" : "error");
    setMessage(response.ok ? "Изменения сохранены." : result.error ?? "Не удалось сохранить");
    setTimeout(() => setState("idle"), 1800);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
          <label className="block text-sm font-bold" htmlFor="title">
            Название
            <input
              id="title"
              name="title"
              defaultValue={ride.title}
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 outline-none focus:border-app-accent"
            />
          </label>
          <label className="mt-4 block text-sm font-bold" htmlFor="description">
            Описание
            <textarea
              id="description"
              name="description"
              defaultValue={ride.description}
              rows={5}
              required
              className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3 outline-none focus:border-app-accent"
            />
          </label>
        </div>

        <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
          <h2 className="text-base font-black">Время и старт</h2>
          <label className="mt-4 block text-sm font-bold" htmlFor="date_time">
            Дата и время
            <input
              id="date_time"
              name="date_time"
              type="datetime-local"
              defaultValue={formatDateInputValue(ride.date_time)}
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 outline-none focus:border-app-accent"
            />
          </label>
          <label className="mt-4 block text-sm font-bold" htmlFor="start_location_name">
            Место старта
            <input
              id="start_location_name"
              name="start_location_name"
              defaultValue={ride.start_location_name}
              required
              className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3 outline-none focus:border-app-accent"
            />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block text-sm font-bold" htmlFor="start_lat">
              Широта
              <input id="start_lat" name="start_lat" type="number" step="0.00001" defaultValue={ride.start_lat} className="mt-2 h-11 w-full rounded-lg border border-app-stroke bg-white px-3" />
            </label>
            <label className="block text-sm font-bold" htmlFor="start_lng">
              Долгота
              <input id="start_lng" name="start_lng" type="number" step="0.00001" defaultValue={ride.start_lng} className="mt-2 h-11 w-full rounded-lg border border-app-stroke bg-white px-3" />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
          <h2 className="text-base font-black">Параметры</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <NumberField id="distance_km" label="Дистанция, км" value={ride.distance_km} />
            <NumberField id="max_participants" label="Лимит" value={ride.max_participants ?? ""} />
            <NumberField id="pace_min_kmh" label="Темп от" value={ride.pace_min_kmh} />
            <NumberField id="pace_max_kmh" label="Темп до" value={ride.pace_max_kmh} />
          </div>
          <label className="mt-4 block text-sm font-bold" htmlFor="level">
            Уровень
            <select id="level" name="level" defaultValue={ride.level} className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3">
              {levelOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm font-bold" htmlFor="ride_type">
            Тип
            <select id="ride_type" name="ride_type" defaultValue={ride.ride_type} className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3">
              {rideTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm font-bold" htmlFor="bike_type">
            Велосипед
            <select id="bike_type" name="bike_type" defaultValue={ride.bike_type} className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3">
              {bikeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm font-bold" htmlFor="status">
            Статус
            <select id="status" name="status" defaultValue={ride.status} className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3">
              <option value="draft">Черновик</option>
              <option value="published">Опубликован</option>
              <option value="cancelled">Отменен</option>
              <option value="archived">Архив</option>
            </select>
          </label>
        </div>

        <div className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
          <h2 className="text-base font-black">Правила и ссылки</h2>
          <TextArea id="rules" label="Правила" value={ride.rules ?? ""} />
          <TextArea id="what_to_bring" label="Что взять" value={ride.what_to_bring ?? ""} />
          <TextField id="route_url" label="Внешняя ссылка на маршрут" value={ride.route_url ?? ""} />
          <TextField id="telegram_chat_url" label="Telegram чат" value={ride.telegram_chat_url ?? ""} />
        </div>

        {message && (
          <p className={`rounded-lg p-3 text-sm font-semibold ${state === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "saving"}
          className="sticky bottom-24 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-app-accent text-base font-bold text-app-accentText shadow-soft disabled:opacity-70"
        >
          {state === "saving" ? <Loader2 className="animate-spin" size={18} /> : state === "saved" ? <Check size={18} /> : <Save size={18} />}
          Сохранить
        </button>
      </form>

      <RideCancelDialog ride={ride} />

      <Link href={`/rides/${ride.id}`} className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-app-stroke bg-app-card text-sm font-bold">
        Вернуться к заезду
      </Link>
    </div>
  );
}

function NumberField({ id, label, value }: { id: string; label: string; value: string | number }) {
  return (
    <label className="block text-sm font-bold" htmlFor={id}>
      {label}
      <input id={id} name={id} type="number" min="1" defaultValue={value} className="mt-2 h-11 w-full rounded-lg border border-app-stroke bg-white px-3" />
    </label>
  );
}

function TextField({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <label className="mt-4 block text-sm font-bold" htmlFor={id}>
      {label}
      <input id={id} name={id} defaultValue={value} className="mt-2 h-11 w-full rounded-lg border border-app-stroke bg-white px-3" />
    </label>
  );
}

function TextArea({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <label className="mt-4 block text-sm font-bold" htmlFor={id}>
      {label}
      <textarea id={id} name={id} defaultValue={value} rows={3} className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3" />
    </label>
  );
}
