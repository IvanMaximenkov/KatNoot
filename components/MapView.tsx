"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { LucideIcon } from "lucide-react";
import {
  Bike,
  BusFront,
  CalendarDays,
  Crosshair,
  LocateFixed,
  MapPin,
  Route,
  TrainFront,
  X
} from "lucide-react";
import { RideCard } from "@/components/RideCard";
import { lineStringToPoints } from "@/lib/geo";
import { mapPointLabels, quickFilters, type QuickFilter } from "@/lib/labels";
import {
  getMapTileConfig,
  moscowCyclingNetwork,
  moscowMapBounds,
  moscowMapDefaultView,
  transitStations,
  type CyclingNetworkLayer,
  type CyclingNetworkLine
} from "@/lib/map-config";
import { bikeMarkerHtml, escapeHtml, transitMarkerHtml } from "@/lib/map-markers";
import type { MapPoint, MapPointType, RideWithClub } from "@/lib/types";

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

type LayerKey = "rides" | CyclingNetworkLayer | "transit" | "points";

const layerButtons: Array<{
  key: LayerKey;
  label: string;
  icon: LucideIcon;
  swatch?: "bikeRoads" | "bikeRoutes" | "aLanes";
}> = [
  { key: "bikeRoads", label: "Велодороги", icon: Bike, swatch: "bikeRoads" },
  { key: "bikeRoutes", label: "Маршруты", icon: Route, swatch: "bikeRoutes" },
  { key: "aLanes", label: "А-полосы", icon: BusFront, swatch: "aLanes" },
  { key: "transit", label: "Метро", icon: TrainFront },
  { key: "points", label: "Точки", icon: MapPin },
  { key: "rides", label: "Заезды", icon: CalendarDays }
];

const mapQuickFilters = quickFilters.filter((filter) => filter !== "Рядом со мной");

export function MapView({ rides, mapPoints }: { rides: RideWithClub[]; mapPoints: MapPoint[] }) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideWithClub | null>(null);
  const [activeFilter, setActiveFilter] = useState<QuickFilter | null>(null);
  const [geoMessage, setGeoMessage] = useState("Москва по умолчанию");
  const [mapReady, setMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(moscowMapDefaultView.zoom);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    rides: true,
    bikeRoads: true,
    bikeRoutes: true,
    aLanes: true,
    transit: true,
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
        attributionControl: false,
        minZoom: 10,
        maxZoom: 18,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        maxBounds: moscowMapBounds,
        maxBoundsViscosity: 0.6
      }).setView(moscowMapDefaultView.center, moscowMapDefaultView.zoom);

      const panes: Array<[string, number]> = [
        ["cycle-halo", 410],
        ["cycle-line", 420],
        ["transit", 455],
        ["map-points", 465],
        ["ride-markers", 475],
        ["selected-route", 485]
      ];

      panes.forEach(([name, zIndex]) => {
        map.createPane(name).style.zIndex = String(zIndex);
      });

      L.tileLayer(tile.url, {
        maxZoom: tile.maxZoom,
        maxNativeZoom: tile.maxNativeZoom,
        attribution: tile.attribution,
        className: tile.className
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution(tile.attribution)
        .addTo(map);

      const syncZoom = () => setCurrentZoom(map.getZoom());
      map.on("zoomend", syncZoom);

      mapRef.current = map;
      setCurrentZoom(map.getZoom());
      setMapReady(true);
      cleanup = () => {
        map.off("zoomend", syncZoom);
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
    const renderedLayers: Array<{ remove: () => void }> = [];

    async function renderLayers() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || !mapReady || cancelled) {
        return;
      }

      const addCyclingLine = (line: CyclingNetworkLine, layer: CyclingNetworkLayer) => {
        if (currentZoom + 0.01 < (line.minZoom ?? 10)) {
          return;
        }

        const style = cyclingLineStyle(layer, currentZoom);
        renderedLayers.push(
          L.polyline(line.points, {
            color: "#ffffff",
            weight: style.weight + 3,
            opacity: style.haloOpacity,
            lineCap: "round",
            lineJoin: "round",
            interactive: false,
            pane: "cycle-halo",
            smoothFactor: 1.4
          }).addTo(map)
        );

        renderedLayers.push(
          L.polyline(line.points, {
            color: style.color,
            weight: style.weight,
            opacity: style.opacity,
            dashArray: style.dashArray,
            lineCap: "round",
            lineJoin: "round",
            pane: "cycle-line",
            smoothFactor: 1.4
          })
            .bindTooltip(line.title, {
              className: "map-line-tooltip",
              direction: "top",
              opacity: 0.94,
              sticky: true
            })
            .addTo(map)
        );
      };

      if (layers.bikeRoads) {
        moscowCyclingNetwork.bikeRoads.forEach((line) => addCyclingLine(line, "bikeRoads"));
      }

      if (layers.bikeRoutes) {
        moscowCyclingNetwork.bikeRoutes.forEach((line) => addCyclingLine(line, "bikeRoutes"));
      }

      if (layers.aLanes) {
        moscowCyclingNetwork.aLanes.forEach((line) => addCyclingLine(line, "aLanes"));
      }

      if (layers.transit && currentZoom >= 12.7) {
        transitStations
          .filter((station) => currentZoom + 0.01 >= station.minZoom)
          .forEach((station) => {
            const iconSize = station.type === "metro" ? 18 : 24;
            renderedLayers.push(
              L.marker([station.lat, station.lng], {
                icon: L.divIcon({
                  html: transitMarkerHtml(station.name, station.type),
                  className: "",
                  iconSize: [iconSize, iconSize],
                  iconAnchor: [iconSize / 2, iconSize / 2]
                }),
                pane: "transit",
                zIndexOffset: 40
              })
                .bindTooltip(station.name, {
                  className: "map-line-tooltip",
                  direction: "top",
                  opacity: 0.94
                })
                .addTo(map)
            );
          });
      }

      if (layers.points && currentZoom >= 13.75) {
        mapPoints.forEach((point) => {
          const style = mapPointStyle(point.type);
          renderedLayers.push(
            L.circleMarker([point.lat, point.lng], {
              radius: currentZoom >= 15 ? 5.5 : 4.5,
              color: "#ffffff",
              fillColor: style.fillColor,
              fillOpacity: 0.95,
              pane: "map-points",
              weight: 2.5
            })
              .bindPopup(pointPopup(point), {
                className: "map-popup",
                closeButton: false,
                maxWidth: 220
              })
              .addTo(map)
          );
        });
      }

      if (layers.rides) {
        filteredRides.forEach((ride) => {
          const compact = currentZoom < 12.5;
          const iconSize = compact ? 24 : 30;
          const marker = L.marker([ride.start_lat, ride.start_lng], {
            icon: L.divIcon({
              html: bikeMarkerHtml(ride.title, `ride-marker${compact ? " ride-marker--compact" : ""}`),
              className: "",
              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize / 2]
            }),
            pane: "ride-markers",
            zIndexOffset: 80
          }).addTo(map);
          marker.on("click", () => setSelectedRide(ride));
          renderedLayers.push(marker);
        });
      }
    }

    renderLayers();

    return () => {
      cancelled = true;
      renderedLayers.forEach((layer) => layer.remove());
    };
  }, [currentZoom, filteredRides, layers, mapPoints, mapReady]);

  useEffect(() => {
    let cancelled = false;
    const renderedLayers: Array<{ remove: () => void }> = [];

    async function renderSelectedRoute() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || !mapReady || cancelled || !selectedRide?.route?.geometry_geojson) {
        return;
      }

      const routePoints = lineStringToPoints(selectedRide.route.geometry_geojson);
      const latLngs = routePoints.map((point) => [point.lat, point.lng] as [number, number]);
      if (latLngs.length <= 1) {
        return;
      }

      renderedLayers.push(
        L.polyline(latLngs, {
          color: "#ffffff",
          weight: 9,
          opacity: 0.78,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
          pane: "selected-route"
        }).addTo(map)
      );

      renderedLayers.push(
        L.polyline(latLngs, {
          color: "#e24b38",
          weight: 5,
          opacity: 0.96,
          lineCap: "round",
          lineJoin: "round",
          pane: "selected-route"
        }).addTo(map)
      );

      map.fitBounds(latLngs, {
        paddingTopLeft: [36, 120],
        paddingBottomRight: [36, 170]
      });
    }

    renderSelectedRoute();

    return () => {
      cancelled = true;
      renderedLayers.forEach((layer) => layer.remove());
    };
  }, [mapReady, selectedRide]);

  function locateUser() {
    if (!navigator.geolocation) {
      setGeoMessage("Геолокация недоступна");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.setView([position.coords.latitude, position.coords.longitude], 14.5);
        setGeoMessage("Показали вашу позицию");
      },
      () => setGeoMessage("Не удалось получить геолокацию")
    );
  }

  function toggleLayer(layer: LayerKey) {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }

  return (
    <div className="relative h-[calc(var(--tg-viewport-height)-76px)] min-h-[560px] overflow-hidden bg-[#edf0ee]">
      <div ref={mapNodeRef} className="absolute inset-0 z-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3">
        <div className="pointer-events-auto rounded-lg border border-white/80 bg-white/90 p-2 shadow-[0_12px_30px_rgb(15_23_42/0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-normal text-slate-900">Велокарта Москвы</p>
              <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-[11px] font-semibold text-slate-500">
                <Crosshair size={12} />
                <span className="truncate">{geoMessage}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={locateUser}
              title="Найти меня"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgb(15_23_42/0.12)]"
            >
              <LocateFixed size={18} />
            </button>
          </div>

          <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} />

          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
            {layerButtons.map((button) => (
              <LayerButton
                key={button.key}
                active={layers[button.key]}
                onClick={() => toggleLayer(button.key)}
                label={button.label}
                Icon={button.icon}
                swatch={button.swatch}
              />
            ))}
          </div>
        </div>
      </div>

      {!selectedRide && <MapLegend />}

      {selectedRide && (
        <div className="absolute inset-x-0 bottom-[84px] z-20 mx-auto w-full max-w-md px-3">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedRide(null)}
              title="Закрыть карточку"
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-[0_10px_24px_rgb(15_23_42/0.18)]"
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

function FilterBar({
  activeFilter,
  onChange
}: {
  activeFilter: QuickFilter | null;
  onChange: (filter: QuickFilter | null) => void;
}) {
  return (
    <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-bold ${
          !activeFilter ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        Все
      </button>
      {mapQuickFilters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(activeFilter === filter ? null : filter)}
          className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-bold ${
            activeFilter === filter
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

function LayerButton({
  active,
  onClick,
  label,
  Icon,
  swatch
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  Icon: LucideIcon;
  swatch?: "bikeRoads" | "bikeRoutes" | "aLanes";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-xs font-bold ${
        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {swatch ? <span className={`map-layer-swatch map-layer-swatch--${swatch}`} /> : <Icon size={13} />}
      {label}
    </button>
  );
}

function MapLegend() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[88px] z-10 flex justify-center px-3">
      <div className="pointer-events-auto inline-flex max-w-full items-center gap-3 overflow-x-auto rounded-lg border border-white/80 bg-white/[0.92] px-3 py-2 text-xs font-semibold text-slate-900 shadow-[0_10px_24px_rgb(15_23_42/0.12)] backdrop-blur-xl hide-scrollbar">
        <LegendItem swatch="bikeRoads" label="Велодороги" />
        <LegendItem swatch="bikeRoutes" label="Маршруты" />
        <LegendItem swatch="aLanes" label="А-полосы" />
      </div>
    </div>
  );
}

function LegendItem({ swatch, label }: { swatch: "bikeRoads" | "bikeRoutes" | "aLanes"; label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      <span className={`map-legend-line map-legend-line--${swatch}`} />
      {label}
    </span>
  );
}

function cyclingLineStyle(layer: CyclingNetworkLayer, zoom: number) {
  if (layer === "bikeRoads") {
    return {
      color: "#3f4e71",
      weight: zoom >= 14 ? 4.2 : 3.3,
      opacity: 0.9,
      haloOpacity: 0.72,
      dashArray: undefined
    };
  }

  if (layer === "bikeRoutes") {
    return {
      color: "#12634c",
      weight: zoom >= 14 ? 3.1 : 2.4,
      opacity: 0.9,
      haloOpacity: 0.65,
      dashArray: "2 6"
    };
  }

  return {
    color: "#4bc2ff",
    weight: zoom >= 14 ? 2.2 : 1.5,
    opacity: 0.86,
    haloOpacity: 0.55,
    dashArray: undefined
  };
}

function mapPointStyle(type: MapPointType) {
  if (type === "dangerous_place" || type === "warning") {
    return { fillColor: "#f97316" };
  }

  if (type === "repair" || type === "water" || type === "cafe") {
    return { fillColor: "#0891b2" };
  }

  return { fillColor: "#1d7c5c" };
}

function pointPopup(point: MapPoint) {
  const label = mapPointLabels[point.type] ?? "Точка";
  const description = point.description ? `<br><span>${escapeHtml(point.description)}</span>` : "";
  return `<strong>${escapeHtml(label)}</strong><br>${escapeHtml(point.title)}${description}`;
}
