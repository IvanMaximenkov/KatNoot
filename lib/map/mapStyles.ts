import type { PathOptions } from "leaflet";
import type { RideStatus } from "@/lib/types";
import type { InfrastructureImportance, NormalizedInfrastructureFeature } from "@/types/map";

export const MAP_PALETTE = {
  bikeLane: "#435979",
  aLane: "#51bfe0",
  selectedRoute: "#f59e0b",
  selectedRouteAlt: "#12b6a6",
  draftRoute: "#0f9f8f",
  ridePublished: "#1d7c5c",
  rideFull: "#475569",
  rideCancelled: "#b4534b",
  point: "#0f766e",
  danger: "#e8792e",
  halo: "#ffffff"
} as const;

export type InfrastructureLineStyle = PathOptions & {
  dashArray?: string;
};

function importanceWeight(
  feature: NormalizedInfrastructureFeature,
  weights: Record<InfrastructureImportance, number>
) {
  return weights[feature.importance];
}

function importanceOpacity(
  importance: InfrastructureImportance,
  zoom: number,
  base: Record<InfrastructureImportance, number>
) {
  const zoomBoost = zoom >= 16 ? 0.14 : zoom >= 13 ? 0.08 : 0;
  return Math.min(0.95, base[importance] + zoomBoost);
}

function zoomLineScale(zoom: number) {
  const clamped = Math.max(9, Math.min(18, zoom));
  return 0.68 + ((clamped - 9) / 9) * 0.72;
}

function scaledWeight(
  feature: NormalizedInfrastructureFeature,
  zoom: number,
  weights: Record<InfrastructureImportance, number>
) {
  return Number((importanceWeight(feature, weights) * zoomLineScale(zoom)).toFixed(2));
}

export function infrastructureLineStyle(
  feature: NormalizedInfrastructureFeature,
  zoom: number
): InfrastructureLineStyle {
  if (feature.type === "a_lane") {
    return {
      color: MAP_PALETTE.aLane,
      weight: scaledWeight(feature, zoom, { major: 2.35, medium: 1.7, minor: 1.15 }),
      opacity: importanceOpacity(feature.importance, zoom, {
        major: 0.58,
        medium: 0.48,
        minor: 0.36
      }),
      dashArray: zoom >= 13 ? "7 5" : "5 6",
      lineCap: "round",
      lineJoin: "round"
    };
  }

  return {
    color: MAP_PALETTE.bikeLane,
    weight: scaledWeight(feature, zoom, { major: 3.2, medium: 2.35, minor: 1.55 }),
    opacity: importanceOpacity(feature.importance, zoom, {
      major: 0.82,
      medium: 0.68,
      minor: 0.52
    }),
    lineCap: "round",
    lineJoin: "round"
  };
}

export function rideMarkerClass(status: RideStatus, selected: boolean, full: boolean) {
  const statusClass =
    status === "cancelled"
      ? "ride-marker--cancelled"
      : full
        ? "ride-marker--full"
        : "ride-marker--published";
  return `ride-marker ${statusClass}${selected ? " ride-marker--selected" : ""}`;
}
