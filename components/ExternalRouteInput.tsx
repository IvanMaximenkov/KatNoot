"use client";

import { FormEvent, useState } from "react";
import { Link2 } from "lucide-react";
import type { RouteDraft } from "@/lib/types";

export function ExternalRouteInput({ onRoute }: { onRoute: (route: RouteDraft) => void }) {
  const [url, setUrl] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return;
    onRoute({
      title: "Внешний маршрут",
      source_type: "external_url",
      original_url: url.trim(),
      file_name: null,
      geometry_geojson: null,
      simplified_geometry_geojson: null,
      distance_km: null,
      elevation_gain_m: null
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="block text-sm font-bold" htmlFor="external_route_url">
        Ссылка на Komoot, Strava или другой маршрут
      </label>
      <div className="flex gap-2">
        <input
          id="external_route_url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
          className="h-11 min-w-0 flex-1 rounded-lg border border-app-stroke bg-white px-3 text-sm outline-none focus:border-app-accent"
        />
        <button
          type="submit"
          title="Сохранить ссылку"
          className="grid h-11 w-11 place-items-center rounded-lg bg-app-accent text-app-accentText"
        >
          <Link2 size={18} />
        </button>
      </div>
      <p className="text-xs font-semibold text-app-muted">
        Автоматический импорт приватных Komoot-маршрутов не используется. Для линии на карте загрузите GPX.
      </p>
    </form>
  );
}
