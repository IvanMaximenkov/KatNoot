"use client";

import { useEffect } from "react";
import type { Map as LeafletMap } from "leaflet";
import { bikeMarkerHtml } from "@/lib/map-markers";
import { rideMarkerClass } from "@/lib/map/mapStyles";
import { shouldClusterRides } from "@/lib/map/zoomRules";
import type { RideWithClub } from "@/lib/types";

type RideCluster = {
  id: string;
  rides: RideWithClub[];
  lat: number;
  lng: number;
};

function cellSizeForZoom(zoom: number) {
  if (zoom <= 9) return 0.24;
  if (zoom <= 10.5) return 0.14;
  return 0.085;
}

function clusterRides(rides: RideWithClub[], zoom: number): RideCluster[] {
  const cellSize = cellSizeForZoom(zoom);
  const clusters = new Map<string, RideWithClub[]>();

  rides.forEach((ride) => {
    const x = Math.round(ride.start_lng / cellSize);
    const y = Math.round(ride.start_lat / cellSize);
    const key = `${x}:${y}`;
    clusters.set(key, [...(clusters.get(key) ?? []), ride]);
  });

  return [...clusters.entries()].map(([id, clusterRides]) => {
    const lat = clusterRides.reduce((sum, ride) => sum + ride.start_lat, 0) / clusterRides.length;
    const lng = clusterRides.reduce((sum, ride) => sum + ride.start_lng, 0) / clusterRides.length;
    return { id, rides: clusterRides, lat, lng };
  });
}

function clusterHtml(count: number) {
  return `<span class="ride-cluster" title="${count} заездов">${count}</span>`;
}

export function RideMarkersLayer({
  map,
  rides,
  selectedRideId,
  currentZoom,
  onSelectRide
}: {
  map: LeafletMap | null;
  rides: RideWithClub[];
  selectedRideId?: string | null;
  currentZoom: number;
  onSelectRide: (ride: RideWithClub) => void;
}) {
  useEffect(() => {
    let cancelled = false;
    const renderedLayers: Array<{ remove: () => void }> = [];

    async function render() {
      const L = await import("leaflet");
      if (!map || cancelled) return;

      if (shouldClusterRides(currentZoom)) {
        clusterRides(rides, currentZoom).forEach((cluster) => {
          const size = Math.min(44, Math.max(30, 24 + cluster.rides.length * 3));
          const marker = L.marker([cluster.lat, cluster.lng], {
            icon: L.divIcon({
              html: clusterHtml(cluster.rides.length),
              className: "",
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2]
            }),
            pane: "ride-clusters",
            zIndexOffset: 60
          }).addTo(map);

          marker.on("click", () => {
            if (cluster.rides.length === 1) {
              onSelectRide(cluster.rides[0]);
              return;
            }
            map.setView([cluster.lat, cluster.lng], Math.min(13, currentZoom + 2));
          });
          renderedLayers.push(marker);
        });
        return;
      }

      rides.forEach((ride) => {
        const selected = ride.id === selectedRideId;
        const full = Boolean(ride.max_participants && ride.participant_count >= ride.max_participants);
        const iconSize = selected ? 38 : currentZoom >= 14 ? 32 : 28;
        const marker = L.marker([ride.start_lat, ride.start_lng], {
          icon: L.divIcon({
            html: bikeMarkerHtml(ride.title, rideMarkerClass(ride.status, selected, full)),
            className: "",
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize / 2, iconSize / 2]
          }),
          pane: "ride-markers",
          zIndexOffset: selected ? 120 : 80
        }).addTo(map);

        marker.on("click", () => onSelectRide(ride));
        renderedLayers.push(marker);
      });
    }

    render();

    return () => {
      cancelled = true;
      renderedLayers.forEach((layer) => layer.remove());
    };
  }, [currentZoom, map, onSelectRide, rides, selectedRideId]);

  return null;
}
