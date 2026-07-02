import { isInfrastructureFeatureVisible } from "@/lib/map/zoomRules";
import type { InfrastructureLayerKey, NormalizedInfrastructureFeature } from "@/types/map";

export type InfrastructureLayerState = Record<InfrastructureLayerKey, boolean>;

export const DEFAULT_INFRASTRUCTURE_LAYERS: InfrastructureLayerState = {
  bikeLanes: true,
  aLanes: true
};

export function infrastructureTypeToLayer(type: NormalizedInfrastructureFeature["type"]): InfrastructureLayerKey {
  return type === "a_lane" ? "aLanes" : "bikeLanes";
}

export function filterInfrastructureFeatures(
  features: NormalizedInfrastructureFeature[],
  layers: InfrastructureLayerState,
  zoom: number
) {
  return features.filter((feature) => {
    const layer = infrastructureTypeToLayer(feature.type);
    if (!layers[layer]) return false;
    return isInfrastructureFeatureVisible(feature, zoom);
  });
}
