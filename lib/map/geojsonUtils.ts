import type { GeoJsonLineString } from "@/lib/types";

export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type GeoJsonMultiLineString = {
  type: "MultiLineString";
  coordinates: Array<Array<[number, number]>>;
};

export type RouteValidationResult =
  | { ok: true; distanceKm: number; simplified: GeoJsonLineString; bbox: [number, number, number, number] }
  | { ok: false; errors: string[] };

export const MOSCOW_REGION_BBOX = {
  minLng: 36.65,
  minLat: 55.15,
  maxLng: 38.85,
  maxLat: 56.22
} as const;

export function isFiniteCoordinate(coordinate: [number, number]) {
  const [lng, lat] = coordinate;
  return Number.isFinite(lng) && Number.isFinite(lat) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function lineStringToLatLngs(line: GeoJsonLineString | null | undefined): Array<[number, number]> {
  return line?.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];
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
  if (!line?.coordinates.length) return null;
  const lngs = line.coordinates.map(([lng]) => lng);
  const lats = line.coordinates.map(([, lat]) => lat);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

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
  return points.slice(1).reduce((sum, point, index) => sum + haversineKm(points[index], point), 0);
}

function perpendicularDistance(point: [number, number], start: [number, number], end: [number, number]) {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.hypot(x - x1, y - y1);
  }

  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function simplifyCoordinates(points: Array<[number, number]>, tolerance: number): Array<[number, number]> {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = perpendicularDistance(points[index], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = index;
    }
  }

  if (maxDistance <= tolerance) {
    return [first, last];
  }

  const left = simplifyCoordinates(points.slice(0, maxIndex + 1), tolerance);
  const right = simplifyCoordinates(points.slice(maxIndex), tolerance);
  return [...left.slice(0, -1), ...right];
}

export function simplifyLineString(line: GeoJsonLineString, tolerance = 0.00055): GeoJsonLineString {
  return {
    type: "LineString",
    coordinates: simplifyCoordinates(line.coordinates, tolerance)
  };
}

function coordinatesInsideMoscowRegion(line: GeoJsonLineString) {
  return line.coordinates.every(([lng, lat]) => {
    return (
      lng >= MOSCOW_REGION_BBOX.minLng &&
      lng <= MOSCOW_REGION_BBOX.maxLng &&
      lat >= MOSCOW_REGION_BBOX.minLat &&
      lat <= MOSCOW_REGION_BBOX.maxLat
    );
  });
}

export function validateRouteGeometry(
  line: GeoJsonLineString | null | undefined,
  options: { allowLongDistance?: boolean; requireMoscowRegion?: boolean } = {}
): RouteValidationResult {
  const errors: string[] = [];

  if (!line || line.type !== "LineString") {
    return { ok: false, errors: ["Маршрут должен быть LineString"] };
  }

  if (line.coordinates.length < 2) {
    errors.push("Добавьте минимум две точки маршрута");
  }

  if (line.coordinates.length > 5000) {
    errors.push("В маршруте слишком много точек. Максимум для клиента: 5000");
  }

  if (!line.coordinates.every(isFiniteCoordinate)) {
    errors.push("В маршруте есть некорректные координаты");
  }

  if (options.requireMoscowRegion ?? true) {
    if (!coordinatesInsideMoscowRegion(line)) {
      errors.push("Координаты маршрута должны быть в пределах Москвы или ближайшего Подмосковья");
    }
  }

  const points = lineStringToPoints(line);
  const distanceKm = Number(routeDistanceKm(points).toFixed(2));
  if (distanceKm <= 0.2) {
    errors.push("Маршрут слишком короткий: нужно больше 0.2 км");
  }

  if (!options.allowLongDistance && distanceKm > 300) {
    errors.push("Маршрут длиннее 300 км. Для обычного заезда это слишком много");
  }

  const bbox = bboxForLine(line);
  if (errors.length || !bbox) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    distanceKm,
    simplified: simplifyLineString(line),
    bbox
  };
}
