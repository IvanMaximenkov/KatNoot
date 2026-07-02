"use client";

import { CyclingMap } from "@/components/map/CyclingMap";
import type { CyclingInfrastructureFeature } from "@/lib/map/cyclingInfrastructure";
import type { MapPoint, RideWithClub } from "@/lib/types";

export function MapView({
  rides,
  mapPoints,
  infrastructure
}: {
  rides: RideWithClub[];
  mapPoints: MapPoint[];
  infrastructure?: CyclingInfrastructureFeature[];
}) {
  return <CyclingMap rides={rides} mapPoints={mapPoints} infrastructure={infrastructure} />;
}
