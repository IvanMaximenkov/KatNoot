import type { CyclingInfrastructureFeature, CyclingInfrastructureType } from "@/lib/map/cyclingInfrastructure";
import { isInfrastructureFeatureVisible, showInfrastructurePoints } from "@/lib/map/zoomRules";

export type InfrastructureLayerKey = "bikeLanes" | "cyclingRoutes" | "aLanes" | "infrastructurePoints";

export type InfrastructureLayerState = Record<InfrastructureLayerKey, boolean>;

export const DEFAULT_INFRASTRUCTURE_LAYERS: InfrastructureLayerState = {
  bikeLanes: true,
  cyclingRoutes: true,
  aLanes: false,
  infrastructurePoints: false
};

export function infrastructureTypeToLayer(type: CyclingInfrastructureType): InfrastructureLayerKey {
  if (type === "cycling_route") return "cyclingRoutes";
  if (type === "a_lane") return "aLanes";
  if (type === "bike_lane") return "bikeLanes";
  return "infrastructurePoints";
}

export function filterInfrastructureFeatures(
  features: CyclingInfrastructureFeature[],
  layers: InfrastructureLayerState,
  zoom: number
) {
  return features.filter((feature) => {
    const layer = infrastructureTypeToLayer(feature.type);
    if (!layers[layer]) return false;
    if (layer === "infrastructurePoints" && !showInfrastructurePoints(zoom)) return false;
    return isInfrastructureFeatureVisible(feature, zoom);
  });
}
