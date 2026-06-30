import type { CyclingLevel, RideWithClub } from "@/lib/types";
import { levelLabels } from "@/lib/labels";

export function formatRideDate(value: string, mode: "short" | "long" = "short") {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: mode === "long" ? "long" : "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatDateInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function isBeginnerFriendly(level: CyclingLevel, noDrop: boolean) {
  return (level === "beginner" || level === "casual") && noDrop;
}

export function rideShareText(ride: RideWithClub, appUrl?: string) {
  const link = appUrl ? `${appUrl.replace(/\/$/, "")}/rides/${ride.id}` : `/rides/${ride.id}`;
  return [
    `🚴 ${ride.title}`,
    formatRideDate(ride.date_time, "long"),
    `${ride.distance_km} км, темп ${ride.pace_min_kmh}-${ride.pace_max_kmh} км/ч`,
    `Старт: ${ride.start_location_name}`,
    `Уровень: ${levelLabels[ride.level]}`,
    `Записаться: ${link}`
  ].join("\n");
}
