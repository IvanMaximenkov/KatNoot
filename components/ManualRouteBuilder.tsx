"use client";

import { useCallback, useMemo, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { BaseMap } from "@/components/map/BaseMap";
import { RouteEditorLayer, type RouteEditorPoint } from "@/components/map/RouteEditorLayer";
import { pointsToLineString, routeDistanceKm, validateRouteGeometry } from "@/lib/map/geojsonUtils";
import type { RouteDraft } from "@/lib/types";

const MANUAL_ROUTE_CENTER: [number, number] = [55.738, 37.61];

export function ManualRouteBuilder({ onRoute }: { onRoute: (route: RouteDraft) => void }) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [points, setPoints] = useState<RouteEditorPoint[]>([]);
  const [message, setMessage] = useState("Кликайте по карте, чтобы добавить точки чернового маршрута.");

  const distance = useMemo(() => Number(routeDistanceKm(points).toFixed(1)), [points]);

  const handlePointsChange = useCallback((nextPoints: RouteEditorPoint[]) => {
    setPoints(nextPoints);
    if (nextPoints.length >= 2) {
      setMessage(`Черновой маршрут: ${nextPoints.length} точек, примерно ${routeDistanceKm(nextPoints).toFixed(1)} км`);
    } else {
      setMessage("Кликайте по карте, чтобы добавить точки чернового маршрута.");
    }
  }, []);

  function save() {
    const geometry = pointsToLineString(points);
    const validation = validateRouteGeometry(geometry);
    if (!validation.ok) {
      setMessage(validation.errors[0] ?? "Маршрут не прошел проверку");
      return;
    }

    onRoute({
      title: "Черновой ручной маршрут",
      source_type: "manual",
      original_url: null,
      file_name: null,
      geometry_geojson: geometry,
      simplified_geometry_geojson: validation.simplified,
      distance_km: Number(validation.distanceKm.toFixed(1)),
      elevation_gain_m: null
    });
    setMessage("Маршрут добавлен в заезд.");
  }

  return (
    <div className="overflow-hidden rounded-lg border border-app-stroke bg-app-bg">
      <div className="relative h-72 w-full">
        <BaseMap
          className="absolute inset-0"
          initialCenter={MANUAL_ROUTE_CENTER}
          initialZoom={12}
          onMapReady={setMap}
          onZoomChange={setCurrentZoom}
        />
        <RouteEditorLayer
          map={map}
          points={points}
          currentZoom={currentZoom}
          enabled
          onChange={handlePointsChange}
        />
      </div>
      <div className="border-t border-app-stroke bg-app-card p-3">
        <p className="text-sm font-semibold text-app-muted">
          {message}
          {points.length > 1 ? ` Прямые линии без роутинга, ${distance} км.` : ""}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handlePointsChange(points.slice(0, -1))}
            disabled={points.length === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-white text-sm font-bold disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Назад
          </button>
          <button
            type="button"
            onClick={() => handlePointsChange([])}
            disabled={points.length === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-white text-sm font-bold disabled:opacity-50"
          >
            <Trash2 size={16} />
            Очистить
          </button>
          <button
            type="button"
            onClick={save}
            disabled={points.length < 2}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-app-accent text-sm font-bold text-app-accentText disabled:opacity-50"
          >
            <Check size={16} />
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
