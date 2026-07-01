import type { CyclingLevel, RideWithClub } from "@/lib/types";
import { bikeTypeLabels, levelLabels } from "@/lib/labels";

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
  return (level === "beginner" || level === "casual" || level === "easy") && noDrop;
}

export function rideShareText(ride: RideWithClub, appUrl?: string) {
  const baseLink = appUrl ? `${appUrl.replace(/\/$/, "")}/rides/${ride.id}` : `/rides/${ride.id}`;
  const link =
    ride.club_id && appUrl
      ? `${baseLink}?source=club&club_id=${ride.club_id}&ride_id=${ride.id}`
      : baseLink;
  const routeLink = ride.route_url || ride.route?.original_url;
  const participantLimit = ride.max_participants ? `/${ride.max_participants}` : "";

  return [
    `🚴 ${ride.title}`,
    `📅 ${formatRideDate(ride.date_time, "long")}`,
    `📍 Старт: ${ride.start_location_name}`,
    ride.finish_location_name ? `🏁 Финиш: ${ride.finish_location_name}` : null,
    `📏 Дистанция: ${ride.distance_km} км`,
    `⚡ Темп: ${ride.pace_min_kmh}-${ride.pace_max_kmh} км/ч`,
    `🎚 Уровень: ${levelLabels[ride.level]}`,
    `🚲 Велосипед: ${bikeTypeLabels[ride.bike_type]}`,
    `🧡 No-drop: ${ride.no_drop ? "да" : "нет"}`,
    routeLink ? `🗺 Маршрут: ${routeLink}` : ride.route ? "🗺 Маршрут: есть в Катнуть" : null,
    `👥 Участники: ${ride.participant_count}${participantLimit}`,
    `🔗 Открыть заезд в Катнуть: ${link}`
  ]
    .filter(Boolean)
    .join("\n");
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[а-я]/g, (letter) => {
      const map: Record<string, string> = {
        а: "a",
        б: "b",
        в: "v",
        г: "g",
        д: "d",
        е: "e",
        ж: "zh",
        з: "z",
        и: "i",
        й: "y",
        к: "k",
        л: "l",
        м: "m",
        н: "n",
        о: "o",
        п: "p",
        р: "r",
        с: "s",
        т: "t",
        у: "u",
        ф: "f",
        х: "h",
        ц: "c",
        ч: "ch",
        ш: "sh",
        щ: "sch",
        ъ: "",
        ы: "y",
        ь: "",
        э: "e",
        ю: "yu",
        я: "ya"
      };
      return map[letter] ?? "";
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
