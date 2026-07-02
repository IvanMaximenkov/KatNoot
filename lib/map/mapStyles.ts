import type { PathOptions } from "leaflet";
import type { CyclingInfrastructureFeature, CyclingInfrastructureType } from "@/lib/map/cyclingInfrastructure";
import { lineOpacityForZoom, lineWeightForZoom } from "@/lib/map/zoomRules";
import type { RideStatus } from "@/lib/types";

export const MAP_PALETTE = {
  bikeLane: "#435979",
  cyclingRoute: "#19745d",
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
  haloWeight: number;
  dashArray?: string;
};

export function infrastructureLineStyle(
  feature: CyclingInfrastructureFeature,
  zoom: number
): InfrastructureLineStyle {
  const baseWeight = feature.importance === "major" ? 3.4 : feature.importance === "medium" ? 2.7 : 2.1;
  const weight = lineWeightForZoom(baseWeight, zoom);

  if (feature.type === "cycling_route") {
    return {
      color: MAP_PALETTE.cyclingRoute,
      weight,
      opacity: lineOpacityForZoom(zoom),
      dashArray: zoom >= 13 ? "5 7" : "3 7",
      lineCap: "round",
      lineJoin: "round",
      haloWeight: weight + 4
    };
  }

  if (feature.type === "a_lane") {
    return {
      color: MAP_PALETTE.aLane,
      weight: Math.max(1.5, weight - 0.8),
      opacity: zoom < 12 ? 0.58 : 0.86,
      lineCap: "round",
      lineJoin: "round",
      haloWeight: weight + 2.4
    };
  }

  return {
    color: MAP_PALETTE.bikeLane,
    weight,
    opacity: lineOpacityForZoom(zoom),
    lineCap: "round",
    lineJoin: "round",
    haloWeight: weight + 3.8
  };
}

export function infrastructurePointColor(type: CyclingInfrastructureType) {
  if (type === "danger") return MAP_PALETTE.danger;
  if (type === "repair") return "#0e7490";
  if (type === "water") return "#0284c7";
  if (type === "bike_parking") return "#4f5f7d";
  return MAP_PALETTE.point;
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
