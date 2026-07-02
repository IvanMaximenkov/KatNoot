import type {
  CyclingInfrastructureType,
  InfrastructureImportance,
  MapLineGeometry,
  NormalizedInfrastructureFeature
} from "@/types/map";

type RawGeoJsonFeature = {
  type: "Feature";
  properties?: Record<string, unknown> | null;
  geometry?: {
    type?: string;
    coordinates?: unknown;
  } | null;
};

type RawGeoJsonCollection = {
  type: "FeatureCollection";
  features?: RawGeoJsonFeature[];
};

function isLineGeometry(geometry: RawGeoJsonFeature["geometry"]): geometry is MapLineGeometry {
  return Boolean(
    geometry &&
      (geometry.type === "LineString" || geometry.type === "MultiLineString") &&
      Array.isArray(geometry.coordinates)
  );
}

function stringValue(tags: Record<string, unknown>, key: string) {
  const value = tags[key];
  return typeof value === "string" ? value : "";
}

function hasTag(tags: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(tags, key);
}

function containsDesignated(tags: Record<string, unknown>, key: string) {
  return stringValue(tags, key).toLowerCase().includes("designated");
}

function bikeLaneImportance(tags: Record<string, unknown>): InfrastructureImportance {
  if (stringValue(tags, "highway") === "cycleway" || stringValue(tags, "bicycle") === "designated") {
    return "major";
  }

  if (hasTag(tags, "cycleway:both") || hasTag(tags, "cycleway")) {
    return "medium";
  }

  return "minor";
}

function aLaneImportance(tags: Record<string, unknown>): InfrastructureImportance {
  if (containsDesignated(tags, "lanes:psv") || containsDesignated(tags, "psv:lanes")) {
    return "major";
  }

  if (
    hasTag(tags, "lanes:psv:forward") ||
    hasTag(tags, "lanes:psv:backward") ||
    hasTag(tags, "psv:lanes:forward") ||
    hasTag(tags, "psv:lanes:backward")
  ) {
    return "medium";
  }

  return "minor";
}

function featureTitle(tags: Record<string, unknown>) {
  return stringValue(tags, "name") || stringValue(tags, "name:ru") || undefined;
}

function stableId(type: CyclingInfrastructureType, tags: Record<string, unknown>, index: number) {
  const rawId = tags["@id"];
  return `${type}:${typeof rawId === "string" && rawId.trim() ? rawId : `feature-${index}`}`;
}

export function normalizeInfrastructureGeoJson(
  collection: RawGeoJsonCollection,
  type: CyclingInfrastructureType
): NormalizedInfrastructureFeature[] {
  if (collection.type !== "FeatureCollection" || !Array.isArray(collection.features)) {
    return [];
  }

  return collection.features
    .map((feature, index): NormalizedInfrastructureFeature | null => {
      if (!isLineGeometry(feature.geometry)) return null;

      const tags = feature.properties ?? {};
      return {
        id: stableId(type, tags, index),
        type,
        title: featureTitle(tags),
        geometry: feature.geometry,
        source: "osm",
        tags,
        importance: type === "bike_lane" ? bikeLaneImportance(tags) : aLaneImportance(tags)
      };
    })
    .filter((feature): feature is NormalizedInfrastructureFeature => Boolean(feature));
}
