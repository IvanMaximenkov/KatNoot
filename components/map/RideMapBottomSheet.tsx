"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, MapPin, Route, ShieldCheck, Users, X } from "lucide-react";
import { formatRideDate } from "@/lib/format";
import { levelTagLabels } from "@/lib/labels";
import type { RideWithClub } from "@/lib/types";

export function RideMapBottomSheet({
  ride,
  onClose
}: {
  ride: RideWithClub;
  onClose: () => void;
}) {
  const hasRoute = Boolean(ride.route?.geometry_geojson || ride.route_url);

  return (
    <div className="absolute inset-x-0 bottom-0 z-[610] px-3 pb-3">
      <section className="mx-auto max-w-md rounded-t-lg border border-white/80 bg-white/95 p-4 shadow-[0_-12px_34px_rgb(15_23_42/0.18)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-normal text-app-accent">
              {ride.organizer.name}
            </p>
            <h2 className="mt-1 text-lg font-black leading-tight text-slate-950">{ride.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Закрыть карточку"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
          <Info icon={<CalendarDays size={14} />} value={formatRideDate(ride.date_time, "short")} />
          <Info icon={<Route size={14} />} value={`${ride.distance_km} км`} />
          <Info icon={<ShieldCheck size={14} />} value={levelTagLabels[ride.level]} />
          <Info
            icon={<Users size={14} />}
            value={`${ride.participant_count}${ride.max_participants ? `/${ride.max_participants}` : ""}`}
          />
        </div>

        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <MapPin size={15} className="text-app-accent" />
          <span className="min-w-0 truncate">{ride.start_location_name}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
          {ride.no_drop && <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">No-drop</span>}
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">
            {hasRoute ? "Есть маршрут" : "Маршрут пока не добавлен"}
          </span>
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700">
            {ride.pace_min_kmh}-{ride.pace_max_kmh} км/ч
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/rides/${ride.id}`}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-app-accent text-sm font-bold text-app-accentText"
          >
            Открыть заезд
          </Link>
          {ride.route_url ? (
            <a
              href={ride.route_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-800"
            >
              Внешний маршрут
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-400"
            >
              Нет ссылки
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function Info({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2">
      <span className="shrink-0 text-app-accent">{icon}</span>
      <span className="min-w-0 truncate">{value}</span>
    </span>
  );
}
