"use client";

import { useEffect } from "react";
import type { Map as LeafletMap } from "leaflet";
import { filterInfrastructureFeatures, type InfrastructureLayerState } from "@/lib/map/infrastructureFilters";
import { infrastructureLineStyle } from "@/lib/map/mapStyles";
import type { NormalizedInfrastructureFeature } from "@/types/map";

function lineCoordinates(feature: NormalizedInfrastructureFeature) {
  if (feature.geometry.type === "LineString") {
    return [feature.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])];
  }

  if (feature.geometry.type === "MultiLineString") {
    return feature.geometry.coordinates.map((line) =>
      line.map(([lng, lat]) => [lat, lng] as [number, number])
    );
  }

  return [];
}

export function CyclingInfrastructureLayer({
  map,
  features,
  layers,
  currentZoom
}: {
  map: LeafletMap | null;
  features: NormalizedInfrastructureFeature[];
  layers: InfrastructureLayerState;
  currentZoom: number;
}) {
  useEffect(() => {
    let cancelled = false;
    const renderedLayers: Array<{ remove: () => void }> = [];

    async function render() {
      const L = await import("leaflet");
      if (!map || cancelled) return;

      const visibleFeatures = filterInfrastructureFeatures(features, layers);

      visibleFeatures.forEach((feature) => {
        const style = infrastructureLineStyle(feature, currentZoom);
        lineCoordinates(feature).forEach((latLngs) => {
          const line = L.polyline(latLngs, {
            ...style,
            interactive: currentZoom >= 15,
            pane: "infrastructure-line",
            smoothFactor: currentZoom < 13 ? 2.2 : 1.1
          }).addTo(map);

          if (currentZoom >= 15 && feature.title) {
            line.bindTooltip(feature.title, {
              className: "map-line-tooltip",
              direction: "top",
              opacity: 0.94,
              sticky: true
            });
          }

          renderedLayers.push(line);
        });
      });
    }

    render();

    return () => {
      cancelled = true;
      renderedLayers.forEach((layer) => layer.remove());
    };
  }, [currentZoom, features, layers, map]);

  return null;
}
