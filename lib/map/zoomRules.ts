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
