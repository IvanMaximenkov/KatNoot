import type { GeoJsonLineString } from "@/lib/types";

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export function routeDistanceKm(points: Array<{ lat: number; lng: number }>) {
  return points
    .slice(1)
    .reduce((sum, point, index) => sum + haversineKm(points[index], point), 0);
}

export function pointsToLineString(points: Array<{ lat: number; lng: number }>): GeoJsonLineString {
  return {
    type: "LineString",
    coordinates: points.map((point) => [point.lng, point.lat])
  };
}

export function lineStringToPoints(line: GeoJsonLineString | null | undefined) {
  return line?.coordinates.map(([lng, lat]) => ({ lat, lng })) ?? [];
}

export function bboxForLine(line: GeoJsonLineString | null | undefined): [number, number, number, number] | null {
  if (!line?.coordinates.length) {
    return null;
  }

  const lngs = line.coordinates.map(([lng]) => lng);
  const lats = line.coordinates.map(([, lat]) => lat);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

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

  if (points.length < 2) {
    throw new Error("В GPX должно быть минимум две точки");
  }

  return {
    points,
    geometry: pointsToLineString(points),
    distance_km: Number(routeDistanceKm(points).toFixed(1))
  };
}
