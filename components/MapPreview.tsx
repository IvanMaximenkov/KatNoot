"use client";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

export function MapPreview({
  lat,
  lng,
  title
}: {
  lat: number;
  lng: number;
  title: string;
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

      const map = L.map(nodeRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        attributionControl: false
      }).setView([lat, lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<span class="ride-marker" title="${title}">В</span>`,
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
  }, [lat, lng, title]);

  return <div ref={nodeRef} className="h-48 overflow-hidden rounded-lg border border-app-stroke" />;
}
