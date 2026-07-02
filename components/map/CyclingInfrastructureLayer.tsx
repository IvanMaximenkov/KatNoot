"use client";

import { useEffect } from "react";
import type { Map as LeafletMap } from "leaflet";
import { escapeHtml } from "@/lib/map-markers";
import { filterInfrastructureFeatures, type InfrastructureLayerState } from "@/lib/map/infrastructureFilters";
import { infrastructureLineStyle, infrastructurePointColor, MAP_PALETTE } from "@/lib/map/mapStyles";
import type { CyclingInfrastructureFeature } from "@/lib/map/cyclingInfrastructure";

function lineCoordinates(feature: CyclingInfrastructureFeature) {
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
  features: CyclingInfrastructureFeature[];
  layers: InfrastructureLayerState;
  currentZoom: number;
}) {
  useEffect(() => {
    let cancelled = false;
    const renderedLayers: Array<{ remove: () => void }> = [];

    async function render() {
      const L = await import("leaflet");
      if (!map || cancelled) return;

      const visibleFeatures = filterInfrastructureFeatures(features, layers, currentZoom);

      visibleFeatures.forEach((feature) => {
        if (feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates;
          const color = infrastructurePointColor(feature.type);
          renderedLayers.push(
            L.circleMarker([lat, lng], {
              radius: currentZoom >= 15 ? 6 : 4.8,
              color: MAP_PALETTE.halo,
              fillColor: color,
              fillOpacity: 0.95,
              pane: "infrastructure-points",
              weight: 2.4
            })
              .bindTooltip(
                `<strong>${escapeHtml(feature.title ?? "Точка")}</strong>${
                  feature.description ? `<br>${escapeHtml(feature.description)}` : ""
                }`,
                { className: "map-line-tooltip", direction: "top", opacity: 0.95 }
              )
              .addTo(map)
          );
          return;
        }

        const style = infrastructureLineStyle(feature, currentZoom);
        lineCoordinates(feature).forEach((latLngs) => {
          renderedLayers.push(
            L.polyline(latLngs, {
              color: MAP_PALETTE.halo,
              weight: style.haloWeight,
              opacity: feature.importance === "minor" ? 0.5 : 0.72,
              lineCap: "round",
              lineJoin: "round",
              interactive: false,
              pane: "infrastructure-halo",
              smoothFactor: currentZoom < 12 ? 2 : 1.2
            }).addTo(map)
          );

          renderedLayers.push(
            L.polyline(latLngs, {
              ...style,
              pane: "infrastructure-line",
              smoothFactor: currentZoom < 12 ? 2 : 1.2
            })
              .bindTooltip(feature.title ?? "Велоинфраструктура", {
                className: "map-line-tooltip",
                direction: "top",
                opacity: 0.94,
                sticky: true
              })
              .addTo(map)
          );
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
