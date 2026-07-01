"use client";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { lineStringToPoints } from "@/lib/geo";
import { getMapTileConfig } from "@/lib/map-config";
import { bikeMarkerHtml } from "@/lib/map-markers";
import type { GeoJsonLineString } from "@/lib/types";

export function MapPreview({
  lat,
  lng,
  title,
  route
}: {
  lat: number;
  lng: number;
  title: string;
  route?: GeoJsonLineString | null;
}) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function mount() {
      const L = await import("leaflet");
      if (!nodeRef.current || mapRef.current) {
        return;
      }

      const tile = getMapTileConfig();
      const map = L.map(nodeRef.current, {
        zoomControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        attributionControl: false
      }).setView([lat, lng], 14);

      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution(tile.attribution)
        .addTo(map);

      L.tileLayer(tile.url, {
        maxZoom: 19,
        attribution: tile.attribution
      }).addTo(map);

      const routePoints = lineStringToPoints(route);
      if (routePoints.length > 1) {
        const latLngs = routePoints.map((point) => [point.lat, point.lng] as [number, number]);
        L.polyline(latLngs, {
          color: "#1d4ed8",
          weight: 5,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(map);
        map.fitBounds(latLngs, { padding: [20, 20] });
      }

      L.marker([lat, lng], {
        icon: L.divIcon({
          html: bikeMarkerHtml(title),
          className: "",
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        })
      }).addTo(map);

      mapRef.current = map;
      cleanup = () => {
        map.remove();
        mapRef.current = null;
      };
    }

    mount();
    return () => cleanup?.();
  }, [lat, lng, route, title]);

  return <div ref={nodeRef} className="h-56 overflow-hidden rounded-lg border border-app-stroke" />;
}
