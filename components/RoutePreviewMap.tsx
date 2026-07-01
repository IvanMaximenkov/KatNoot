"use client";

import { MapPreview } from "@/components/MapPreview";
import { lineStringToPoints } from "@/lib/geo";
import type { RouteDraft } from "@/lib/types";

export function RoutePreviewMap({ route }: { route: RouteDraft | null }) {
  const points = lineStringToPoints(route?.geometry_geojson);
  if (!route?.geometry_geojson || points.length === 0) {
    return null;
  }

  return (
    <MapPreview
      lat={points[0].lat}
      lng={points[0].lng}
      title={route.title}
      route={route.geometry_geojson}
    />
  );
}
