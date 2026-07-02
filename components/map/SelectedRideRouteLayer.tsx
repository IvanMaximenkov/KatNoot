"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { bikeMarkerHtml } from "@/lib/map-markers";
import { lineStringToLatLngs, simplifyLineString } from "@/lib/map/geojsonUtils";
import { MAP_PALETTE } from "@/lib/map/mapStyles";
import { selectedRouteUseSimplifiedGeometry } from "@/lib/map/zoomRules";
import type { GeoJsonLineString, RideWithClub } from "@/lib/types";

function routeGeometryForZoom(ride: RideWithClub, zoom: number): GeoJsonLineString | null {
  const geometry = ride.route?.geometry_geojson ?? null;
  if (!geometry) return null;
  if (selectedRouteUseSimplifiedGeometry(zoom)) {
    return ride.route?.simplified_geometry_geojson ?? simplifyLineString(geometry, 0.001);
  }
  return geometry;
}

export function SelectedRideRouteLayer({
  map,
  ride,
  currentZoom
}: {
  map: LeafletMap | null;
  ride: RideWithClub | null;
  currentZoom: number;
}) {
  const fittedRideIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const renderedLayers: Array<{ remove: () => void }> = [];

    async function render() {
      const L = await import("leaflet");
      if (!map || !ride || cancelled) return;

      const geometry = routeGeometryForZoom(ride, currentZoom);
      const latLngs = lineStringToLatLngs(geometry);

      renderedLayers.push(
        L.marker([ride.start_lat, ride.start_lng], {
          icon: L.divIcon({
            html: bikeMarkerHtml("Старт", "ride-marker ride-marker--selected ride-marker--start"),
            className: "",
            iconSize: [38, 38],
            iconAnchor: [19, 19]
          }),
          pane: "selected-route",
          zIndexOffset: 140
        }).addTo(map)
      );

      if (ride.finish_lat && ride.finish_lng) {
        renderedLayers.push(
          L.circleMarker([ride.finish_lat, ride.finish_lng], {
            radius: 8,
            color: "#ffffff",
            fillColor: MAP_PALETTE.selectedRoute,
            fillOpacity: 1,
            weight: 3,
            pane: "selected-route"
          })
            .bindTooltip("Финиш", { className: "map-line-tooltip", direction: "top", opacity: 0.95 })
            .addTo(map)
        );
      }

      if (latLngs.length <= 1) return;

      renderedLayers.push(
        L.polyline(latLngs, {
          color: "#ffffff",
          weight: currentZoom >= 14 ? 10 : 8,
          opacity: 0.82,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
          pane: "selected-route"
        }).addTo(map)
      );

      renderedLayers.push(
        L.polyline(latLngs, {
          color: MAP_PALETTE.selectedRoute,
          weight: currentZoom >= 14 ? 5.8 : 4.8,
          opacity: 0.98,
          lineCap: "round",
          lineJoin: "round",
          pane: "selected-route"
        }).addTo(map)
      );

      if (fittedRideIdRef.current !== ride.id) {
        fittedRideIdRef.current = ride.id;
        map.fitBounds(latLngs, {
          paddingTopLeft: [32, 128],
          paddingBottomRight: [32, 190],
          maxZoom: 15.5
        });
      }
    }

    render();

    return () => {
      cancelled = true;
      renderedLayers.forEach((layer) => layer.remove());
    };
  }, [currentZoom, map, ride]);

  return null;
}
