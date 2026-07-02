import demoInfrastructure from "@/data/demo/cyclingInfrastructure.geojson";
import type { GeoJsonMultiLineString, GeoJsonPoint } from "@/lib/map/geojsonUtils";
import type { GeoJsonLineString, MapPoint, MapPointType } from "@/lib/types";

export type CyclingInfrastructureType =
  | "bike_lane"
  | "cycling_route"
  | "a_lane"
  | "bike_parking"
  | "repair"
  | "water"
  | "danger"
  | "meeting_point";

export type CyclingInfrastructureSource = "osm" | "manual" | "demo" | "import";
export type CyclingInfrastructureImportance = "major" | "medium" | "minor";

export type CyclingInfrastructureGeometry = GeoJsonLineString | GeoJsonMultiLineString | GeoJsonPoint;

export type CyclingInfrastructureFeature = {
  id: string;
  type: CyclingInfrastructureType;
  title?: string;
  description?: string;
  geometry: CyclingInfrastructureGeometry;
  source: CyclingInfrastructureSource;
  importance: CyclingInfrastructureImportance;
  min_zoom?: number;
};

type RawFeature = {
  type: "Feature";
  properties?: {
    id?: unknown;
    type?: unknown;
    title?: unknown;
    description?: unknown;
    source?: unknown;
    importance?: unknown;
    min_zoom?: unknown;
  };
  geometry?: CyclingInfrastructureGeometry | null;
};

type RawFeatureCollection = {
  type: "FeatureCollection";
  features: RawFeature[];
};

const infrastructureTypes = new Set<CyclingInfrastructureType>([
  "bike_lane",
  "cycling_route",
  "a_lane",
  "bike_parking",
  "repair",
  "water",
  "danger",
  "meeting_point"
]);

const infrastructureSources = new Set<CyclingInfrastructureSource>(["osm", "manual", "demo", "import"]);
const infrastructureImportances = new Set<CyclingInfrastructureImportance>(["major", "medium", "minor"]);

function asInfrastructureType(value: unknown): CyclingInfrastructureType {
  return typeof value === "string" && infrastructureTypes.has(value as CyclingInfrastructureType)
    ? (value as CyclingInfrastructureType)
    : "meeting_point";
}

function asSource(value: unknown): CyclingInfrastructureSource {
  return typeof value === "string" && infrastructureSources.has(value as CyclingInfrastructureSource)
    ? (value as CyclingInfrastructureSource)
    : "demo";
}

function asImportance(value: unknown): CyclingInfrastructureImportance {
  return typeof value === "string" && infrastructureImportances.has(value as CyclingInfrastructureImportance)
    ? (value as CyclingInfrastructureImportance)
    : "medium";
}

function isSupportedGeometry(geometry: CyclingInfrastructureGeometry | null | undefined) {
  return geometry?.type === "LineString" || geometry?.type === "MultiLineString" || geometry?.type === "Point";
}

export function normalizeCyclingInfrastructureGeoJson(
  collection: RawFeatureCollection
): CyclingInfrastructureFeature[] {
  return collection.features
    .map((feature, index): CyclingInfrastructureFeature | null => {
      if (!isSupportedGeometry(feature.geometry)) return null;
      const properties = feature.properties ?? {};
      const id = typeof properties.id === "string" ? properties.id : `infrastructure-${index + 1}`;
      const minZoom = Number(properties.min_zoom);

      return {
        id,
        type: asInfrastructureType(properties.type),
        title: typeof properties.title === "string" ? properties.title : undefined,
        description: typeof properties.description === "string" ? properties.description : undefined,
        geometry: feature.geometry,
        source: asSource(properties.source),
        importance: asImportance(properties.importance),
        min_zoom: Number.isFinite(minZoom) ? minZoom : undefined
      } satisfies CyclingInfrastructureFeature;
    })
    .filter((feature): feature is CyclingInfrastructureFeature => Boolean(feature));
}

function mapPointTypeToInfrastructureType(type: MapPointType): CyclingInfrastructureType {
  if (type === "bike_lane") return "bike_lane";
  if (type === "bike_route") return "cycling_route";
  if (type === "a_lane") return "a_lane";
  if (type === "parking") return "bike_parking";
  if (type === "repair") return "repair";
  if (type === "water") return "water";
  if (type === "dangerous_place" || type === "warning") return "danger";
  return "meeting_point";
}

export function mapPointsToInfrastructureFeatures(mapPoints: MapPoint[]): CyclingInfrastructureFeature[] {
  return mapPoints.map((point) => ({
    id: `map-point-${point.id}`,
    type: mapPointTypeToInfrastructureType(point.type),
    title: point.title,
    description: point.description ?? undefined,
    geometry: point.geometry_geojson ?? {
      type: "Point",
      coordinates: [point.lng, point.lat]
    },
    source: point.source === "osm" || point.source === "manual" || point.source === "import" ? point.source : "demo",
    importance: point.type === "bike_lane" || point.type === "bike_route" || point.type === "a_lane" ? "medium" : "minor",
    min_zoom: point.geometry_geojson ? 12 : 14
  }));
}

export const demoCyclingInfrastructure = normalizeCyclingInfrastructureGeoJson(
  demoInfrastructure as RawFeatureCollection
);
