"use client";

import { useEffect } from "react";
import type { LeafletMouseEvent, Map as LeafletMap } from "leaflet";
import { MAP_PALETTE } from "@/lib/map/mapStyles";
import { showRouteEditorHandles } from "@/lib/map/zoomRules";

export type RouteEditorPoint = { lat: number; lng: number };

export function RouteEditorLayer({
  map,
  points,
  currentZoom,
  enabled,
  onChange
}: {
  map: LeafletMap | null;
  points: RouteEditorPoint[];
  currentZoom: number;
  enabled: boolean;
  onChange: (points: RouteEditorPoint[]) => void;
}) {
  useEffect(() => {
    if (!map || !enabled) return;

    const addPoint = (event: LeafletMouseEvent) => {
      onChange([
        ...points,
        {
          lat: Number(event.latlng.lat.toFixed(5)),
          lng: Number(event.latlng.lng.toFixed(5))
        }
      ]);
    };

    map.on("click", addPoint);
    return () => {
      map.off("click", addPoint);
    };
  }, [enabled, map, onChange, points]);

  useEffect(() => {
    let cancelled = false;
    const renderedLayers: Array<{ remove: () => void }> = [];

    async function render() {
      const L = await import("leaflet");
      if (!map || cancelled || points.length === 0) return;

      const latLngs = points.map((point) => [point.lat, point.lng] as [number, number]);
      if (points.length > 1) {
        renderedLayers.push(
          L.polyline(latLngs, {
            color: "#ffffff",
            weight: 9,
            opacity: 0.82,
            lineCap: "round",
            lineJoin: "round",
            interactive: false,
            pane: "route-editor"
          }).addTo(map)
        );
        renderedLayers.push(
          L.polyline(latLngs, {
            color: MAP_PALETTE.draftRoute,
            weight: 5,
            opacity: 0.96,
            dashArray: "8 7",
            lineCap: "round",
            lineJoin: "round",
            pane: "route-editor"
          }).addTo(map)
        );
      }

      if (!showRouteEditorHandles(currentZoom)) {
        return;
      }

      points.forEach((point, index) => {
        const marker = L.marker([point.lat, point.lng], {
          draggable: enabled,
          icon: L.divIcon({
            html: `<span class="route-editor-point">${index + 1}</span>`,
            className: "",
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          }),
          pane: "route-editor",
          zIndexOffset: 160
        }).addTo(map);

        marker.on("dragend", () => {
          const next = marker.getLatLng();
          onChange(
            points.map((candidate, pointIndex) =>
              pointIndex === index
                ? { lat: Number(next.lat.toFixed(5)), lng: Number(next.lng.toFixed(5)) }
                : candidate
            )
          );
        });

        renderedLayers.push(marker);
      });
    }

    render();

    return () => {
      cancelled = true;
      renderedLayers.forEach((layer) => layer.remove());
    };
  }, [currentZoom, enabled, map, onChange, points]);

  return null;
}
