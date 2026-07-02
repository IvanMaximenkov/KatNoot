"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Map as LeafletMap } from "leaflet";
import { ArrowLeft, Layers, LocateFixed, MapPinned, Navigation } from "lucide-react";
import { BaseMap } from "@/components/map/BaseMap";
import { CyclingInfrastructureLayer } from "@/components/map/CyclingInfrastructureLayer";
import { DEFAULT_MAP_LAYERS, MapLayerControls, type MapLayerState } from "@/components/map/MapLayerControls";
import { MapLegend } from "@/components/map/MapLegend";
import { RideMapBottomSheet } from "@/components/map/RideMapBottomSheet";
import { RideMarkersLayer } from "@/components/map/RideMarkersLayer";
import { SelectedRideRouteLayer } from "@/components/map/SelectedRideRouteLayer";
import { useCyclingInfrastructure } from "@/hooks/useCyclingInfrastructure";
import { haversineKm } from "@/lib/map/geojsonUtils";
import { MAP_STORAGE_KEYS, MOSCOW_MAP_DEFAULT_VIEW } from "@/lib/map/mapConfig";
import type { MapPoint, RideWithClub } from "@/lib/types";

type MapRideFilter =
  | "today"
  | "tomorrow"
  | "weekend"
  | "beginner"
  | "noDrop"
  | "hasRoute"
  | "nearby"
  | "road"
  | "gravel"
  | "coffee"
  | "night";

const mapRideFilters: Array<{ key: MapRideFilter; label: string }> = [
  { key: "today", label: "Сегодня" },
  { key: "tomorrow", label: "Завтра" },
  { key: "weekend", label: "Выходные" },
  { key: "beginner", label: "Новичкам" },
  { key: "noDrop", label: "No-drop" },
  { key: "hasRoute", label: "Есть маршрут" },
  { key: "nearby", label: "Рядом" },
  { key: "road", label: "Шоссе" },
  { key: "gravel", label: "Гравел" },
  { key: "coffee", label: "Коферайды" },
  { key: "night", label: "Ночные" }
];

type UserLocation = { lat: number; lng: number };
const DEFAULT_MAP_MESSAGE = "Москва, обзор велослоев";

function readStoredLayers() {
  if (typeof window === "undefined") return DEFAULT_MAP_LAYERS;
  const stored = window.localStorage.getItem(MAP_STORAGE_KEYS.layers);
  if (!stored) return DEFAULT_MAP_LAYERS;

  try {
    const parsed = JSON.parse(stored) as Partial<MapLayerState>;
    return { ...DEFAULT_MAP_LAYERS, ...parsed };
  } catch {
    return DEFAULT_MAP_LAYERS;
  }
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function rideMatchesFilter(ride: RideWithClub, filter: MapRideFilter, userLocation: UserLocation | null) {
  const rideDate = new Date(ride.date_time);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (filter === "today") return sameDay(rideDate, today);
  if (filter === "tomorrow") return sameDay(rideDate, tomorrow);
  if (filter === "weekend") return [0, 6].includes(rideDate.getDay());
  if (filter === "beginner") return ride.no_drop && ["beginner", "casual", "easy"].includes(ride.level);
  if (filter === "noDrop") return ride.no_drop;
  if (filter === "hasRoute") return Boolean(ride.route?.geometry_geojson || ride.route_url);
  if (filter === "road") return ride.ride_type === "road" || ride.bike_type === "road";
  if (filter === "gravel") return ride.ride_type === "gravel" || ride.bike_type === "gravel";
  if (filter === "coffee") return ride.ride_type === "coffee";
  if (filter === "night") return ride.ride_type === "night";
  if (filter === "nearby") {
    if (!userLocation) return true;
    return haversineKm(userLocation, { lat: ride.start_lat, lng: ride.start_lng }) <= 10;
  }
  return true;
}

export function CyclingMap({
  rides,
  mapPoints: _mapPoints
}: {
  rides: RideWithClub[];
  mapPoints?: MapPoint[];
}) {
  const { bikeLanes, aLanes, isLoading, error, unavailableLayers } = useCyclingInfrastructure();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [currentZoom, setCurrentZoom] = useState(MOSCOW_MAP_DEFAULT_VIEW.zoom);
  const [selectedRide, setSelectedRide] = useState<RideWithClub | null>(null);
  const [layers, setLayers] = useState<MapLayerState>(DEFAULT_MAP_LAYERS);
  const [layerSheetOpen, setLayerSheetOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<MapRideFilter>>(() => new Set());
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MAP_MESSAGE);
  const [providerError, setProviderError] = useState<string | null>(null);

  useEffect(() => {
    setLayers(readStoredLayers());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MAP_STORAGE_KEYS.layers, JSON.stringify(layers));
    }
  }, [layers]);

  const infrastructureFeatures = useMemo(() => [...bikeLanes, ...aLanes], [aLanes, bikeLanes]);

  const filteredRides = useMemo(() => {
    return rides.filter((ride) =>
      [...activeFilters].every((filter) => rideMatchesFilter(ride, filter, userLocation))
    );
  }, [activeFilters, rides, userLocation]);

  const handleMapReady = useCallback((leafletMap: LeafletMap | null) => {
    setMap(leafletMap);
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom);
  }, []);

  const handleProviderError = useCallback((error: string) => {
    setProviderError(error);
  }, []);

  const handleSelectRide = useCallback((ride: RideWithClub) => {
    setSelectedRide(ride);
  }, []);

  function locateUser(applyNearbyFilter = false) {
    if (!navigator.geolocation) {
      setMessage("Геолокация недоступна");
      return;
    }

    setMessage("Запрашиваем геолокацию");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: Number(position.coords.latitude.toFixed(5)),
          lng: Number(position.coords.longitude.toFixed(5))
        };
        setUserLocation(nextLocation);
        setShowUserLocation(true);
        map?.setView([nextLocation.lat, nextLocation.lng], Math.max(14, currentZoom));
        setMessage(applyNearbyFilter ? "Показали заезды рядом" : "Показали вашу позицию");
        if (applyNearbyFilter) {
          setActiveFilters((current) => new Set([...current, "nearby"]));
        }
      },
      () => setMessage("Геолокация не разрешена")
    );
  }

  function toggleFilter(filter: MapRideFilter) {
    if (filter === "nearby" && !activeFilters.has("nearby") && !userLocation) {
      locateUser(true);
      return;
    }

    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    let rendered: { remove: () => void } | null = null;

    async function renderUserLocation() {
      const L = await import("leaflet");
      if (!map || !showUserLocation || !userLocation || cancelled) return;
      rendered = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        color: "#ffffff",
        fillColor: "#2563eb",
        fillOpacity: 0.92,
        pane: "user-location",
        weight: 3
      })
        .bindTooltip("Вы здесь", { className: "map-line-tooltip", direction: "top", opacity: 0.95 })
        .addTo(map);
    }

    renderUserLocation();

    return () => {
      cancelled = true;
      rendered?.remove();
    };
  }, [map, showUserLocation, userLocation]);

  const infrastructureMessage = isLoading
    ? "Загружаем OSM велослои"
    : error
      ? `Часть слоев недоступна: ${error}`
      : `${bikeLanes.length} велодорожек · ${aLanes.length} А-полос`;
  const mapSubtitle = message === DEFAULT_MAP_MESSAGE ? infrastructureMessage : message;

  return (
    <div className="katnut-map relative h-[calc(var(--tg-viewport-height)-76px)] min-h-[560px] overflow-hidden bg-[#eef2ef]">
      <BaseMap
        onMapReady={handleMapReady}
        onZoomChange={handleZoomChange}
        onProviderError={handleProviderError}
      />

      <CyclingInfrastructureLayer
        map={map}
        features={infrastructureFeatures}
        layers={layers}
        currentZoom={currentZoom}
      />
      {layers.rides && (
        <RideMarkersLayer
          map={map}
          rides={filteredRides}
          selectedRideId={selectedRide?.id}
          currentZoom={currentZoom}
          onSelectRide={handleSelectRide}
        />
      )}
      {layers.selectedRideRoute && <SelectedRideRouteLayer map={map} ride={selectedRide} currentZoom={currentZoom} />}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[560] px-3 pt-3">
        <div className="pointer-events-auto rounded-lg border border-white/80 bg-white/90 p-2 shadow-[0_12px_30px_rgb(15_23_42/0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-normal text-slate-950">Велокарта Москвы</p>
              <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-[11px] font-semibold text-slate-500">
                <MapPinned size={12} />
                <span className="truncate">{mapSubtitle}</span>
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => setLayerSheetOpen(true)}
                title="Слои"
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgb(15_23_42/0.12)]"
              >
                <Layers size={17} />
              </button>
              <button
                type="button"
                onClick={() => locateUser(false)}
                title="Геолокация"
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgb(15_23_42/0.12)]"
              >
                <LocateFixed size={17} />
              </button>
            </div>
          </div>

          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
            {mapRideFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => toggleFilter(filter.key)}
                className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-bold ${
                  activeFilters.has(filter.key)
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <Link
              href="/"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700"
            >
              <ArrowLeft size={13} />
              К списку
            </Link>
            <button
              type="button"
              onClick={() => locateUser(true)}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700"
            >
              <Navigation size={13} />
              Показать ближайшие
            </button>
          </div>
        </div>
      </div>

      {providerError && (
        <div className="absolute inset-x-3 top-[142px] z-[570] rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
          {providerError}
        </div>
      )}

      {activeFilters.size > 0 && filteredRides.length === 0 && (
        <div className="absolute left-3 right-3 top-[142px] z-[570] rounded-lg border border-slate-200 bg-white/92 px-3 py-2 text-center text-xs font-bold text-slate-600 shadow-[0_8px_22px_rgb(15_23_42/0.12)]">
          Подходящих заездов нет
        </div>
      )}

      {!selectedRide && <MapLegend />}
      {selectedRide && <RideMapBottomSheet ride={selectedRide} onClose={() => setSelectedRide(null)} />}
      <MapLayerControls
        open={layerSheetOpen}
        layers={layers}
        hasSelectedRide={Boolean(selectedRide)}
        unavailableLayers={unavailableLayers}
        onChange={setLayers}
        onClose={() => setLayerSheetOpen(false)}
      />

      <div className="pointer-events-none absolute bottom-[82px] right-3 z-[530] rounded-lg border border-white/80 bg-white/90 px-2 py-1 text-[10px] font-black text-slate-500 shadow-[0_8px_20px_rgb(15_23_42/0.12)]">
        z {currentZoom.toFixed(1)}
      </div>
    </div>
  );
}
