"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Crosshair, Layers, LocateFixed, X } from "lucide-react";
import { FilterChips } from "@/components/FilterChips";
import { RideCard } from "@/components/RideCard";
import { lineStringToPoints } from "@/lib/geo";
import { demoCyclingLines, getMapTileConfig } from "@/lib/map-config";
import { bikeMarkerHtml } from "@/lib/map-markers";
import type { QuickFilter } from "@/lib/labels";
import type { MapPoint, RideWithClub } from "@/lib/types";

function matchesFilter(ride: RideWithClub, filter: QuickFilter | null) {
  if (!filter) return true;
  const date = new Date(ride.date_time);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (candidate: Date) =>
    candidate.getFullYear() === date.getFullYear() &&
    candidate.getMonth() === date.getMonth() &&
    candidate.getDate() === date.getDate();

  if (filter === "Сегодня") return sameDay(today);
  if (filter === "Завтра") return sameDay(tomorrow);
  if (filter === "Выходные") return [0, 6].includes(date.getDay());
  if (filter === "Новичкам") return ride.no_drop && ["beginner", "casual", "easy"].includes(ride.level);
  if (filter === "No-drop") return ride.no_drop;
  if (filter === "Есть маршрут") return Boolean(ride.route || ride.route_url);
  if (filter === "Коферайды") return ride.ride_type === "coffee";
  if (filter === "Шоссе") return ride.ride_type === "road" || ride.bike_type === "road";
  if (filter === "Гравел") return ride.ride_type === "gravel" || ride.bike_type === "gravel";
  if (filter === "Ночные") return ride.ride_type === "night";
  return true;
}

type LayerKey = "rides" | "bikeLanes" | "bikeRoutes" | "aLanes" | "points";

export function MapView({ rides, mapPoints }: { rides: RideWithClub[]; mapPoints: MapPoint[] }) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideWithClub | null>(null);
  const [activeFilter, setActiveFilter] = useState<QuickFilter | null>(null);
  const [geoMessage, setGeoMessage] = useState("Москва по умолчанию");
  const [mapReady, setMapReady] = useState(false);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    rides: true,
    bikeLanes: true,
    bikeRoutes: true,
    aLanes: true,
    points: true
  });
  const filteredRides = useMemo(
    () => rides.filter((ride) => matchesFilter(ride, activeFilter)),
    [rides, activeFilter]
  );

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function mountMap() {
      const L = await import("leaflet");
      if (!mapNodeRef.current || mapRef.current || cancelled) {
        return;
      }

      const tile = getMapTileConfig();
      const map = L.map(mapNodeRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([55.738, 37.61], 12);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution(tile.attribution)
        .addTo(map);

      L.tileLayer(tile.url, {
        maxZoom: 19,
        attribution: tile.attribution
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
      cleanup = () => {
        map.remove();
        mapRef.current = null;
        setMapReady(false);
      };
    }

    mountMap();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const leafletLayers: Array<{ remove: () => void }> = [];

    async function renderLayers() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || !mapReady || cancelled) {
        return;
      }

      if (layers.bikeLanes) {
        demoCyclingLines.bikeLanes.forEach((line) => {
          leafletLayers.push(
            L.polyline(line as [number, number][], { color: "#143a8b", weight: 5, opacity: 0.75 }).addTo(map)
          );
        });
      }

      if (layers.bikeRoutes) {
        demoCyclingLines.bikeRoutes.forEach((line) => {
          leafletLayers.push(
            L.polyline(line as [number, number][], { color: "#15803d", weight: 4, opacity: 0.75, dashArray: "8 8" }).addTo(map)
          );
        });
      }

      if (layers.aLanes) {
        demoCyclingLines.aLanes.forEach((line) => {
          leafletLayers.push(
            L.polyline(line as [number, number][], { color: "#0ea5e9", weight: 4, opacity: 0.75 }).addTo(map)
          );
        });
      }

      if (layers.points) {
        mapPoints.forEach((point) => {
          leafletLayers.push(
            L.circleMarker([point.lat, point.lng], {
              radius: 6,
              color: "#0f172a",
              fillColor: point.type === "dangerous_place" || point.type === "warning" ? "#f97316" : "#38bdf8",
              fillOpacity: 0.85,
              weight: 2
            })
              .bindPopup(`<strong>${point.title}</strong><br>${point.description ?? ""}`)
              .addTo(map)
          );
        });
      }

      if (layers.rides) {
        filteredRides.forEach((ride) => {
          const icon = L.divIcon({
            html: bikeMarkerHtml(ride.title),
            className: "",
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });
          const marker = L.marker([ride.start_lat, ride.start_lng], { icon }).addTo(map);
          marker.on("click", () => setSelectedRide(ride));
          leafletLayers.push(marker);
        });
      }

      if (selectedRide?.route?.geometry_geojson) {
        const routePoints = lineStringToPoints(selectedRide.route.geometry_geojson);
        const latLngs = routePoints.map((point) => [point.lat, point.lng] as [number, number]);
        if (latLngs.length > 1) {
          leafletLayers.push(
            L.polyline(latLngs, {
              color: "#ef4444",
              weight: 6,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round"
            }).addTo(map)
          );
          map.fitBounds(latLngs, { padding: [40, 40] });
        }
      }
    }

    renderLayers();

    return () => {
      cancelled = true;
      leafletLayers.forEach((layer) => layer.remove());
    };
  }, [filteredRides, layers, mapPoints, mapReady, selectedRide]);

  function locateUser() {
    if (!navigator.geolocation) {
      setGeoMessage("Геолокация недоступна, оставили центр Москвы");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.setView([position.coords.latitude, position.coords.longitude], 14);
        setGeoMessage("Показали вашу позицию");
      },
      () => setGeoMessage("Не получилось получить геолокацию")
    );
  }

  function toggleLayer(layer: LayerKey) {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }

  return (
    <div className="relative h-[calc(var(--tg-viewport-height)-76px)] min-h-screen overflow-hidden bg-app-bg">
      <div ref={mapNodeRef} className="absolute inset-0 z-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-app-bg via-app-bg/90 to-transparent px-4 pb-8 pt-4">
        <div className="pointer-events-auto">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
                Велокарта Москвы
              </p>
              <h1 className="text-2xl font-black">Старты и маршруты</h1>
            </div>
            <button
              type="button"
              onClick={locateUser}
              title="Найти меня"
              className="grid h-11 w-11 place-items-center rounded-lg bg-app-card text-app-accent shadow-soft"
            >
              <LocateFixed size={20} />
            </button>
          </div>
          <FilterChips
            activeFilter={activeFilter}
            onChange={setActiveFilter}
            className="mt-4"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-app-card px-3 py-2 text-xs font-semibold text-app-muted shadow-soft">
              <Crosshair size={14} />
              {geoMessage}
            </div>
            <LayerButton active={layers.rides} onClick={() => toggleLayer("rides")} label="Заезды" />
            <LayerButton active={layers.bikeLanes} onClick={() => toggleLayer("bikeLanes")} label="Вело" />
            <LayerButton active={layers.bikeRoutes} onClick={() => toggleLayer("bikeRoutes")} label="Маршруты" />
            <LayerButton active={layers.aLanes} onClick={() => toggleLayer("aLanes")} label="А-полосы" />
            <LayerButton active={layers.points} onClick={() => toggleLayer("points")} label="Точки" />
          </div>
        </div>
      </div>

      {selectedRide && (
        <div className="absolute inset-x-0 bottom-[84px] z-20 mx-auto w-full max-w-md px-3">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedRide(null)}
              title="Закрыть карточку"
              className="grid h-10 w-10 place-items-center rounded-lg bg-app-card text-app-muted shadow-soft"
            >
              <X size={18} />
            </button>
          </div>
          <RideCard ride={selectedRide} compact />
        </div>
      )}
    </div>
  );
}

function LayerButton({
  active,
  onClick,
  label
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold shadow-soft ${
        active ? "bg-app-accent text-app-accentText" : "bg-app-card text-app-muted"
      }`}
    >
      <Layers size={13} />
      {label}
    </button>
  );
}
