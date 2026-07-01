"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { pointsToLineString, routeDistanceKm } from "@/lib/geo";
import { getMapTileConfig } from "@/lib/map-config";
import type { RouteDraft } from "@/lib/types";

type Point = { lat: number; lng: number };

export function ManualRouteBuilder({ onRoute }: { onRoute: (route: RouteDraft) => void }) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function mount() {
      const L = await import("leaflet");
      if (!nodeRef.current || mapRef.current || cancelled) return;
      const tile = getMapTileConfig();
      const map = L.map(nodeRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([55.738, 37.61], 12);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer(tile.url, { maxZoom: 19, attribution: tile.attribution }).addTo(map);
      map.on("click", (event) => {
        setPoints((current) => [
          ...current,
          {
            lat: Number(event.latlng.lat.toFixed(5)),
            lng: Number(event.latlng.lng.toFixed(5))
          }
        ]);
      });
      mapRef.current = map;
      cleanup = () => {
        map.remove();
        mapRef.current = null;
      };
    }

    mount();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const rendered: Array<{ remove: () => void }> = [];

    async function render() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || cancelled) return;
      points.forEach((point, index) => {
        rendered.push(
          L.circleMarker([point.lat, point.lng], {
            radius: index === 0 ? 7 : 5,
            color: "#1d7c5c",
            fillColor: index === 0 ? "#1d7c5c" : "#ffffff",
            fillOpacity: 1,
            weight: 3
          }).addTo(map)
        );
      });
      if (points.length > 1) {
        const latLngs = points.map((point) => [point.lat, point.lng] as [number, number]);
        rendered.push(
          L.polyline(latLngs, {
            color: "#1d4ed8",
            weight: 5,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round"
          }).addTo(map)
        );
      }
    }

    render();
    return () => {
      cancelled = true;
      rendered.forEach((layer) => layer.remove());
    };
  }, [points]);

  const distance = Number(routeDistanceKm(points).toFixed(1));

  function save() {
    if (points.length < 2) return;
    onRoute({
      title: "Ручной маршрут",
      source_type: "manual",
      original_url: null,
      file_name: null,
      geometry_geojson: pointsToLineString(points),
      distance_km: distance,
      elevation_gain_m: null
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-app-stroke bg-app-bg">
      <div ref={nodeRef} className="h-64 w-full" />
      <div className="border-t border-app-stroke bg-app-card p-3">
        <p className="text-sm font-semibold text-app-muted">
          Кликайте по карте, чтобы добавить точки. Сейчас: {points.length} точек
          {points.length > 1 ? `, ${distance} км` : ""}.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPoints((current) => current.slice(0, -1))}
            disabled={points.length === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-white text-sm font-bold disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Назад
          </button>
          <button
            type="button"
            onClick={() => setPoints([])}
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
