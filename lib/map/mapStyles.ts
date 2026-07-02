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
  const zoomBoost = zoom >= 15 ? 0.12 : zoom >= 13 ? 0.06 : 0;
  return Math.min(0.95, base[importance] + zoomBoost);
}

export function infrastructureLineStyle(
  feature: NormalizedInfrastructureFeature,
  zoom: number
): InfrastructureLineStyle {
  if (feature.type === "a_lane") {
    return {
      color: MAP_PALETTE.aLane,
      weight: importanceWeight(feature, { major: 2.5, medium: 1.8, minor: 1.2 }),
      opacity: zoom <= 10 ? 0.15 : importanceOpacity(feature.importance, zoom, {
        major: 0.62,
        medium: 0.48,
        minor: 0.34
      }),
      dashArray: zoom >= 13 ? "7 5" : undefined,
      lineCap: "round",
      lineJoin: "round"
    };
  }

  return {
    color: MAP_PALETTE.bikeLane,
    weight: importanceWeight(feature, { major: 3.5, medium: 2.5, minor: 1.5 }),
    opacity: importanceOpacity(feature.importance, zoom, {
      major: 0.86,
      medium: 0.72,
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
