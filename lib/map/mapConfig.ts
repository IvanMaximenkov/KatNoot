export type MapProvider = "demo_osm" | "maptiler" | "mapbox" | "custom";

export interface MapTileConfig {
  provider: MapProvider;
  url: string;
  attribution: string;
  minZoom: number;
  maxZoom: number;
  maxNativeZoom: number;
  className: string;
  styleUrl: string | null;
  isDemoProvider: boolean;
}

export const MOSCOW_MAP_DEFAULT_VIEW = {
  center: [55.7558, 37.6176] as [number, number],
  zoom: 10.75
};

export const MOSCOW_MAP_BOUNDS: [[number, number], [number, number]] = [
  [55.26, 36.72],
  [56.12, 38.72]
];

export const MAP_STORAGE_KEYS = {
  layers: "katnut.map.layers.v3"
} as const;

const osmAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const cartoAttribution = `${osmAttribution} &copy; <a href="https://carto.com/attributions">CARTO</a>`;
const mapTilerAttribution = `${osmAttribution} &copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>`;
const mapboxAttribution = `${osmAttribution} &copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>`;

function parseProvider(value: string | undefined): MapProvider {
  if (value === "maptiler" || value === "mapbox" || value === "custom") {
    return value;
  }
  return "demo_osm";
}

function numberFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getMapTileConfig(): MapTileConfig {
  const provider = parseProvider(process.env.NEXT_PUBLIC_MAP_PROVIDER);
  const customUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL?.trim();
  const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() || null;
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const attributionOverride = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION?.trim();

  const common = {
    provider,
    minZoom: numberFromEnv(process.env.NEXT_PUBLIC_MAP_MIN_ZOOM, 9),
    maxZoom: numberFromEnv(process.env.NEXT_PUBLIC_MAP_MAX_ZOOM, 19),
    maxNativeZoom: numberFromEnv(process.env.NEXT_PUBLIC_MAP_MAX_NATIVE_ZOOM, 18),
    className: "map-tile-soft",
    styleUrl
  };

  if (provider === "custom") {
    return {
      ...common,
      url: customUrl || "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: attributionOverride || cartoAttribution,
      isDemoProvider: !customUrl
    };
  }

  if (provider === "maptiler" && mapTilerKey) {
    return {
      ...common,
      url: customUrl || `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapTilerKey}`,
      attribution: attributionOverride || mapTilerAttribution,
      isDemoProvider: false
    };
  }

  if (provider === "mapbox" && mapboxToken) {
    return {
      ...common,
      url:
        customUrl ||
        `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`,
      attribution: attributionOverride || mapboxAttribution,
      isDemoProvider: false
    };
  }

  return {
    ...common,
    provider: "demo_osm",
    url: customUrl || "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: attributionOverride || cartoAttribution,
    isDemoProvider: true
  };
}
