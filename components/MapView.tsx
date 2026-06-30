"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Crosshair, LocateFixed, X } from "lucide-react";
import { FilterChips } from "@/components/FilterChips";
import { RideCard } from "@/components/RideCard";
import { bikeMarkerHtml } from "@/lib/map-markers";
import type { QuickFilter } from "@/lib/labels";
import type { RideWithClub } from "@/lib/types";

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
  if (filter === "Новичкам") return ride.no_drop && ["beginner", "casual"].includes(ride.level);
  if (filter === "Коферайды") return ride.ride_type === "coffee";
  if (filter === "Шоссе") return ride.ride_type === "road" || ride.bike_type === "road";
  if (filter === "Гравел") return ride.ride_type === "gravel" || ride.bike_type === "gravel";
  if (filter === "Ночные") return ride.ride_type === "night";
  return true;
}

export function MapView({ rides }: { rides: RideWithClub[] }) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideWithClub | null>(null);
  const [activeFilter, setActiveFilter] = useState<QuickFilter | null>(null);
  const [geoMessage, setGeoMessage] = useState("Москва по умолчанию");
  const [mapReady, setMapReady] = useState(false);
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

      const map = L.map(mapNodeRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([55.738, 37.61], 12);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution("© OpenStreetMap")
        .addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
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
    const markerLayers: Array<{ remove: () => void }> = [];

    async function renderMarkers() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || !mapReady || cancelled) {
        return;
      }

      filteredRides.forEach((ride) => {
        const icon = L.divIcon({
          html: bikeMarkerHtml(ride.title),
          className: "",
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
        const marker = L.marker([ride.start_lat, ride.start_lng], { icon }).addTo(map);
        marker.on("click", () => setSelectedRide(ride));
        markerLayers.push(marker);
      });
    }

    renderMarkers();

    return () => {
      cancelled = true;
      markerLayers.forEach((marker) => marker.remove());
    };
  }, [filteredRides, mapReady]);

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

  return (
    <div className="relative h-[calc(var(--tg-viewport-height)-76px)] min-h-screen overflow-hidden bg-app-bg">
      <div ref={mapNodeRef} className="absolute inset-0 z-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-app-bg via-app-bg/90 to-transparent px-4 pb-8 pt-4">
        <div className="pointer-events-auto">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
                Карта Москвы
              </p>
              <h1 className="text-2xl font-black">Старты заездов</h1>
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
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-app-card px-3 py-2 text-xs font-semibold text-app-muted shadow-soft">
            <Crosshair size={14} />
            {geoMessage}
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
