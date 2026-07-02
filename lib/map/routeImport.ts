import { pointsToLineString, validateRouteGeometry } from "@/lib/map/geojsonUtils";

export function parseGpxTrack(gpxText: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(gpxText, "application/xml");
  const parserError = document.querySelector("parsererror");
  if (parserError) {
    throw new Error("GPX не распознан");
  }

  const nodes = Array.from(document.querySelectorAll("trkpt, rtept"));
  const points = nodes
    .map((node) => ({
      lat: Number(node.getAttribute("lat")),
      lng: Number(node.getAttribute("lon"))
    }))
    .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

  const geometry = pointsToLineString(points);
  const validation = validateRouteGeometry(geometry);

  if (!validation.ok) {
    throw new Error(validation.errors[0] ?? "Маршрут не прошел проверку");
  }

  return {
    points,
    geometry,
    simplified_geometry: validation.simplified,
    distance_km: Number(validation.distanceKm.toFixed(1)),
    bbox: validation.bbox
  };
}
