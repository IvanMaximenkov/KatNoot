import type { NormalizedInfrastructureFeature } from "@/types/map";

export const ZOOM_RULES = {
  cityOverviewMax: 10,
  districtOverviewMin: 11,
  districtOverviewMax: 12.99,
  infrastructureMin: 13,
  detailedMin: 15,
  editorMin: 15,
  maxDetailMin: 16
} as const;

export type ZoomTier = "city" | "district" | "infrastructure" | "detailed" | "max";

export function getZoomTier(zoom: number): ZoomTier {
  if (zoom <= ZOOM_RULES.cityOverviewMax) return "city";
  if (zoom < ZOOM_RULES.infrastructureMin) return "district";
  if (zoom < ZOOM_RULES.detailedMin) return "infrastructure";
  if (zoom < ZOOM_RULES.maxDetailMin) return "detailed";
  return "max";
}

export function shouldClusterRides(zoom: number) {
  return zoom < ZOOM_RULES.infrastructureMin;
}

export function showRouteEditorHandles(zoom: number) {
  return zoom >= ZOOM_RULES.editorMin;
}

export function selectedRouteUseSimplifiedGeometry(zoom: number) {
  return zoom < ZOOM_RULES.detailedMin;
}

export function isInfrastructureFeatureVisible(feature: NormalizedInfrastructureFeature, zoom: number) {
  if (zoom <= ZOOM_RULES.cityOverviewMax) {
    return feature.type === "bike_lane" && feature.importance === "major";
  }

  if (zoom < ZOOM_RULES.infrastructureMin) {
    if (feature.type === "bike_lane") return feature.importance !== "minor";
    return feature.importance === "major";
  }

  if (zoom < ZOOM_RULES.detailedMin) {
    if (feature.type === "bike_lane") return true;
    return feature.importance !== "minor";
  }

  return true;
}
