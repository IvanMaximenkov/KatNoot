export type CyclingInfrastructureType = "bike_lane" | "a_lane";

export type InfrastructureImportance = "major" | "medium" | "minor";

export type InfrastructureLayerKey = "bikeLanes" | "aLanes";

export type MapLineString = {
  type: "LineString";
  coordinates: Array<[number, number]>;
};

export type MapMultiLineString = {
  type: "MultiLineString";
  coordinates: Array<Array<[number, number]>>;
};

export type MapLineGeometry = MapLineString | MapMultiLineString;

export type NormalizedInfrastructureFeature = {
  id: string;
  type: CyclingInfrastructureType;
  title?: string;
  geometry: MapLineGeometry;
  source: "osm";
  tags: Record<string, unknown>;
  importance: InfrastructureImportance;
};
