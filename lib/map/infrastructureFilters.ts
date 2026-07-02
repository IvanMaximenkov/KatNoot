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
  layers: InfrastructureLayerState
) {
  return features.filter((feature) => {
    const layer = infrastructureTypeToLayer(feature.type);
    return layers[layer];
  });
}
