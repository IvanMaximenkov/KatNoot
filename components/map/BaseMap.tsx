"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { getMapTileConfig, MOSCOW_MAP_BOUNDS, MOSCOW_MAP_DEFAULT_VIEW } from "@/lib/map/mapConfig";

const MAP_PANES: Array<[string, number]> = [
  ["infrastructure-halo", 410],
  ["infrastructure-line", 420],
  ["infrastructure-points", 455],
  ["ride-clusters", 465],
  ["ride-markers", 475],
  ["selected-route", 485],
  ["route-editor", 495],
  ["user-location", 505]
];

export function BaseMap({
  className = "absolute inset-0",
  initialCenter = MOSCOW_MAP_DEFAULT_VIEW.center,
  initialZoom = MOSCOW_MAP_DEFAULT_VIEW.zoom,
  interactive = true,
  onMapReady,
  onZoomChange,
  onProviderError
}: {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  interactive?: boolean;
  onMapReady: (map: LeafletMap | null) => void;
  onZoomChange?: (zoom: number) => void;
  onProviderError?: (message: string) => void;
}) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [status, setStatus] = useState("Загружаем карту");

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function mountMap() {
      const L = await import("leaflet");
      if (!mapNodeRef.current || mapRef.current || cancelled) return;

      const tile = getMapTileConfig();
      const map = L.map(mapNodeRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        minZoom: tile.minZoom,
        maxZoom: tile.maxZoom,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        maxBounds: MOSCOW_MAP_BOUNDS,
        maxBoundsViscosity: interactive ? 0.55 : 0
      }).setView(initialCenter, initialZoom);

      MAP_PANES.forEach(([name, zIndex]) => {
        map.createPane(name).style.zIndex = String(zIndex);
      });

      const tileLayer = L.tileLayer(tile.url, {
        minZoom: tile.minZoom,
        maxZoom: tile.maxZoom,
        maxNativeZoom: tile.maxNativeZoom,
        attribution: tile.attribution,
        className: tile.className
      });

      tileLayer.on("tileerror", () => {
        onProviderError?.("Не удалось загрузить тайлы карты");
      });
      tileLayer.addTo(map);

      if (interactive) {
        L.control.zoom({ position: "bottomright" }).addTo(map);
      }

      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution(tile.attribution)
        .addTo(map);

      const syncZoom = () => onZoomChange?.(map.getZoom());
      map.on("zoomend", syncZoom);
      map.on("load", () => setStatus(""));

      mapRef.current = map;
      onZoomChange?.(map.getZoom());
      onMapReady(map);
      setStatus("");

      cleanup = () => {
        map.off("zoomend", syncZoom);
        map.remove();
        mapRef.current = null;
        onMapReady(null);
      };
    }

    mountMap().catch(() => {
      setStatus("Карта временно недоступна");
      onProviderError?.("Не удалось инициализировать карту");
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [initialCenter, initialZoom, interactive, onMapReady, onProviderError, onZoomChange]);

  return (
    <div className={className}>
      <div ref={mapNodeRef} className="h-full w-full" />
      {status && (
        <div className="pointer-events-none absolute inset-0 z-[400] grid place-items-center bg-[#eef2ef] text-sm font-bold text-slate-500">
          {status}
        </div>
      )}
    </div>
  );
}
