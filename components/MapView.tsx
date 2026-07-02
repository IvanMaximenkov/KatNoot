"use client";

import { CyclingMap } from "@/components/map/CyclingMap";
import type { MapPoint, RideWithClub } from "@/lib/types";

export function MapView({
  rides,
  mapPoints
}: {
  rides: RideWithClub[];
  mapPoints: MapPoint[];
}) {
  return <CyclingMap rides={rides} mapPoints={mapPoints} />;
}
