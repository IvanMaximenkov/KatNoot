"use client";

import { ChangeEvent, useState } from "react";
import { FileUp } from "lucide-react";
import { parseGpxTrack } from "@/lib/geo";
import type { RouteDraft } from "@/lib/types";

export function GpxUpload({ onRoute }: { onRoute: (route: RouteDraft) => void }) {
  const [message, setMessage] = useState("GPX-файл не выбран");

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.name.toLowerCase().endsWith(".gpx")) {
      setMessage("Нужен файл .gpx");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseGpxTrack(text);
      onRoute({
        title: file.name.replace(/\.gpx$/i, ""),
        source_type: "gpx_upload",
        original_url: null,
        file_name: file.name,
        geometry_geojson: parsed.geometry,
        simplified_geometry_geojson: parsed.simplified_geometry,
        distance_km: parsed.distance_km,
        elevation_gain_m: null
      });
      setMessage(`Загружено ${parsed.points.length} точек, примерно ${parsed.distance_km} км`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось прочитать GPX");
    }
  }

  return (
    <div className="rounded-lg border border-app-stroke bg-app-bg/50 p-3">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-app-stroke bg-white px-3 py-4 text-sm font-bold">
        <FileUp size={18} className="text-app-accent" />
        Загрузить GPX
        <input type="file" accept=".gpx,application/gpx+xml" className="sr-only" onChange={onFile} />
      </label>
      <p className="mt-2 text-xs font-semibold text-app-muted">{message}</p>
    </div>
  );
}
