import type { CyclingInfrastructureFeature } from "@/lib/map/cyclingInfrastructure";

export const ZOOM_RULES = {
  cityOverviewMax: 9,
  districtOverviewMin: 10,
  districtOverviewMax: 11.99,
  infrastructureMin: 12,
  detailedMin: 14,
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

export function showInfrastructurePoints(zoom: number) {
  return zoom >= ZOOM_RULES.detailedMin;
}

export function showRouteEditorHandles(zoom: number) {
  return zoom >= ZOOM_RULES.editorMin;
}

export function selectedRouteUseSimplifiedGeometry(zoom: number) {
  return zoom < ZOOM_RULES.detailedMin;
}

export function infrastructureFeatureMinZoom(feature: CyclingInfrastructureFeature) {
  if (feature.min_zoom) return feature.min_zoom;
  if (feature.importance === "major") return ZOOM_RULES.cityOverviewMax;
  if (feature.importance === "medium") return ZOOM_RULES.districtOverviewMin;
  return ZOOM_RULES.infrastructureMin;
}

export function isInfrastructureFeatureVisible(feature: CyclingInfrastructureFeature, zoom: number) {
  if (zoom + 0.01 < infrastructureFeatureMinZoom(feature)) return false;
  if (zoom <= ZOOM_RULES.cityOverviewMax && feature.importance !== "major") return false;
  if (zoom < ZOOM_RULES.infrastructureMin && feature.importance === "minor") return false;
  return true;
}

export function lineWeightForZoom(base: number, zoom: number) {
  if (zoom >= ZOOM_RULES.maxDetailMin) return base + 1.2;
  if (zoom >= ZOOM_RULES.detailedMin) return base + 0.7;
  if (zoom >= ZOOM_RULES.infrastructureMin) return base + 0.25;
  return Math.max(1.2, base - 0.45);
}

export function lineOpacityForZoom(zoom: number) {
  if (zoom <= ZOOM_RULES.cityOverviewMax) return 0.72;
  if (zoom < ZOOM_RULES.infrastructureMin) return 0.82;
  return 0.92;
}
