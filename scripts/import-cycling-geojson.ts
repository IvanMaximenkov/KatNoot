import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const allowedTypes = new Set([
  "bike_lane",
  "cycling_route",
  "a_lane",
  "bike_parking",
  "repair",
  "water",
  "danger",
  "meeting_point"
]);

const allowedGeometryTypes = new Set(["LineString", "MultiLineString", "Point"]);

type Feature = {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry?: { type?: string; coordinates?: unknown } | null;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

function readCollection(path: string): FeatureCollection {
  const json = JSON.parse(readFileSync(path, "utf8")) as Partial<FeatureCollection>;
  if (json.type !== "FeatureCollection" || !Array.isArray(json.features)) {
    throw new Error("Input must be a GeoJSON FeatureCollection");
  }
  return json as FeatureCollection;
}

function normalizeFeature(feature: Feature, index: number): Feature | null {
  if (!feature.geometry?.type || !allowedGeometryTypes.has(feature.geometry.type)) {
    return null;
  }

  const properties = feature.properties ?? {};
  const type = typeof properties.type === "string" && allowedTypes.has(properties.type) ? properties.type : "bike_lane";
  const importance =
    properties.importance === "major" || properties.importance === "minor" ? properties.importance : "medium";
  const source = properties.source === "osm" || properties.source === "manual" || properties.source === "import"
    ? properties.source
    : "import";

  return {
    type: "Feature",
    properties: {
      id: typeof properties.id === "string" ? properties.id : `import-${index + 1}`,
      type,
      title: typeof properties.title === "string" ? properties.title : undefined,
      description: typeof properties.description === "string" ? properties.description : undefined,
      source,
      importance,
      min_zoom: typeof properties.min_zoom === "number" ? properties.min_zoom : undefined
    },
    geometry: feature.geometry
  };
}

const inputPath = process.argv[2];
const outputPath = process.argv[3] ?? "data/demo/cyclingInfrastructure.geojson";

if (!inputPath) {
  throw new Error("Usage: tsx scripts/import-cycling-geojson.ts input.geojson [output.geojson]");
}

const input = readCollection(resolve(inputPath));
const output: FeatureCollection = {
  type: "FeatureCollection",
  features: input.features
    .map((feature, index) => normalizeFeature(feature, index))
    .filter((feature): feature is Feature => Boolean(feature))
};

writeFileSync(resolve(outputPath), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Imported ${output.features.length} cycling infrastructure features to ${outputPath}`);
