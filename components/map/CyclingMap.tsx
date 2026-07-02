"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Map as LeafletMap } from "leaflet";
import { ArrowLeft, Layers, LocateFixed, MapPinned, Minus, Navigation, Plus } from "lucide-react";
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
  | "hasRoute"
  | "nearby"
  | "road"
  | "gravel"
  | "coffee"
  | "night";

type DateFilterMode = "all" | "today" | "tomorrow" | "weekend" | "custom";

const dateFilterOptions: Array<{ key: DateFilterMode; label: string }> = [
  { key: "all", label: "Все" },
  { key: "today", label: "Сегодня" },
  { key: "tomorrow", label: "Завтра" },
  { key: "weekend", label: "Выходные" },
  { key: "custom", label: "Период" }
];

const mapRideFilters: Array<{ key: MapRideFilter; label: string }> = [
  { key: "hasRoute", label: "Есть маршрут" },
  { key: "nearby", label: "Рядом" },
  { key: "road", label: "Шоссе" },
  { key: "gravel", label: "Гравел" },
  { key: "coffee", label: "Коферайды" },
  { key: "night", label: "Ночные" }
];

type UserLocation = { lat: number; lng: number };
const DEFAULT_MAP_MESSAGE = "Москва, заезды на карте";

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

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function shortDateLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit" }).format(date);
}

function rideCountWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "заезд";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "заезда";
  return "заездов";
}

function weekendRange(today = new Date()) {
  const day = today.getDay();
  const daysUntilSaturday = day === 0 ? -1 : (6 - day + 7) % 7;
  const start = startOfDay(addDays(today, daysUntilSaturday));
  return { start, end: endOfDay(addDays(start, 1)) };
}

function selectedDateRange(mode: DateFilterMode, customFrom: string, customTo: string) {
  const today = startOfDay(new Date());

  if (mode === "today") {
    return { start: today, end: endOfDay(today), label: "сегодня" };
  }

  if (mode === "tomorrow") {
    const tomorrow = addDays(today, 1);
    return { start: tomorrow, end: endOfDay(tomorrow), label: "завтра" };
  }

  if (mode === "weekend") {
    return { ...weekendRange(today), label: "на выходные" };
  }

  if (mode === "custom") {
    const from = parseDateInput(customFrom) ?? today;
    const to = parseDateInput(customTo) ?? from;
    const start = startOfDay(from <= to ? from : to);
    const end = endOfDay(from <= to ? to : from);
    return {
      start,
      end,
      label: `${shortDateLabel(start)}-${shortDateLabel(end)}`
    };
  }

  return { start: null, end: null, label: "всего" };
}

function rideInDateRange(
  ride: RideWithClub,
  range: ReturnType<typeof selectedDateRange>
) {
  if (!range.start || !range.end) return true;
  const rideTime = new Date(ride.date_time).getTime();
  return rideTime >= range.start.getTime() && rideTime <= range.end.getTime();
}

function rideMatchesFilter(ride: RideWithClub, filter: MapRideFilter, userLocation: UserLocation | null) {
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
  const { bikeLanes, aLanes, unavailableLayers } = useCyclingInfrastructure();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [currentZoom, setCurrentZoom] = useState(MOSCOW_MAP_DEFAULT_VIEW.zoom);
  const [selectedRide, setSelectedRide] = useState<RideWithClub | null>(null);
  const [layers, setLayers] = useState<MapLayerState>(DEFAULT_MAP_LAYERS);
  const [layerSheetOpen, setLayerSheetOpen] = useState(false);
  const [dateMode, setDateMode] = useState<DateFilterMode>("all");
  const [customFrom, setCustomFrom] = useState(() => dateInputValue(new Date()));
  const [customTo, setCustomTo] = useState(() => dateInputValue(addDays(new Date(), 2)));
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
  const dateRange = useMemo(
    () => selectedDateRange(dateMode, customFrom, customTo),
    [customFrom, customTo, dateMode]
  );

  const filteredRides = useMemo(() => {
    return rides.filter((ride) =>
      rideInDateRange(ride, dateRange) &&
      [...activeFilters].every((filter) => rideMatchesFilter(ride, filter, userLocation))
    );
  }, [activeFilters, dateRange, rides, userLocation]);

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

  const zoomMap = useCallback(
    (direction: 1 | -1) => {
      if (!map) return;
      const nextZoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), currentZoom + direction * 0.75));
      map.setZoom(nextZoom, { animate: true });
    },
    [currentZoom, map]
  );

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

  const rideCountMessage = `${filteredRides.length} ${rideCountWord(filteredRides.length)} ${dateRange.label}`;
  const mapSubtitle = message === DEFAULT_MAP_MESSAGE ? rideCountMessage : `${rideCountMessage} · ${message}`;

  return (
    <div className="katnut-map relative h-[calc(var(--tg-viewport-height)-var(--bottom-nav-height))] min-h-[420px] overflow-hidden bg-[#eef2ef]">
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
            <div className="grid shrink-0 grid-cols-4 gap-1.5">
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
              <button
                type="button"
                onClick={() => zoomMap(1)}
                title="Приблизить"
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgb(15_23_42/0.12)]"
              >
                <Plus size={18} />
              </button>
              <button
                type="button"
                onClick={() => zoomMap(-1)}
                title="Отдалить"
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgb(15_23_42/0.12)]"
              >
                <Minus size={18} />
              </button>
            </div>
          </div>

          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
            {dateFilterOptions.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setDateMode(filter.key)}
                className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-bold ${
                  dateMode === filter.key
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {dateMode === "custom" && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <input
                aria-label="Дата начала"
                type="date"
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
                className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700"
              />
              <input
                aria-label="Дата конца"
                type="date"
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
                className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700"
              />
            </div>
          )}

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
    </div>
  );
}
