"use client";

import { Bike, BusFront, LocateFixed, MapPin, Route, X } from "lucide-react";
import type { InfrastructureLayerState } from "@/lib/map/infrastructureFilters";

export type MapLayerState = InfrastructureLayerState & {
  rides: boolean;
  geolocation: boolean;
};

export const DEFAULT_MAP_LAYERS: MapLayerState = {
  rides: true,
  bikeLanes: true,
  cyclingRoutes: true,
  aLanes: false,
  infrastructurePoints: false,
  geolocation: false
};

const layerOptions = [
  {
    key: "rides",
    label: "Заезды",
    description: "Старты и кластеры",
    icon: MapPin
  },
  {
    key: "bikeLanes",
    label: "Велодорожки",
    description: "Выделенные городские участки",
    icon: Bike
  },
  {
    key: "cyclingRoutes",
    label: "Веломаршруты",
    description: "Крупные городские связки",
    icon: Route
  },
  {
    key: "aLanes",
    label: "А-полосы",
    description: "Участки с доступом для велосипедов",
    icon: BusFront
  },
  {
    key: "infrastructurePoints",
    label: "Точки",
    description: "Ремонт, вода, сборы, предупреждения",
    icon: MapPin
  },
  {
    key: "geolocation",
    label: "Мой район",
    description: "Позиция и ближайшие заезды",
    icon: LocateFixed
  }
] as const;

export function MapLayerControls({
  open,
  layers,
  onChange,
  onClose
}: {
  open: boolean;
  layers: MapLayerState;
  onChange: (layers: MapLayerState) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  function toggle(key: keyof MapLayerState) {
    onChange({ ...layers, [key]: !layers[key] });
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-[620] px-3 pb-[calc(env(safe-area-inset-bottom)+86px)]">
      <div className="mx-auto max-w-md rounded-t-lg border border-white/80 bg-white/95 p-3 shadow-[0_-12px_34px_rgb(15_23_42/0.18)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-950">Слои карты</p>
            <p className="text-xs font-semibold text-slate-500">Состояние сохраняется на устройстве</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Закрыть слои"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {layerOptions.map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.key}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-slate-700 shadow-[0_5px_12px_rgb(15_23_42/0.08)]">
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-slate-900">{option.label}</span>
                  <span className="block truncate text-xs font-semibold text-slate-500">{option.description}</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers[option.key]}
                  onChange={() => toggle(option.key)}
                  className="h-5 w-5 accent-[rgb(var(--app-accent))]"
                />
              </label>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="map-layer-swatch map-layer-swatch--bikeLanes" />
            велодорожки
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="map-layer-swatch map-layer-swatch--cyclingRoutes" />
            маршруты
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="map-layer-swatch map-layer-swatch--aLanes" />
            А-полосы
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="map-layer-swatch map-layer-swatch--selectedRide" />
            заезд
          </span>
        </div>
      </div>
    </div>
  );
}
