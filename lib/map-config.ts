export function getMapTileConfig() {
  return {
    url:
      process.env.NEXT_PUBLIC_MAP_TILE_URL ||
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
      "© OpenStreetMap contributors",
    styleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL || null
  };
}

export const demoCyclingLines = {
  bikeLanes: [
    [
      [55.7298, 37.6037],
      [55.7337, 37.5993],
      [55.7422, 37.6078],
      [55.752, 37.6285]
    ],
    [
      [55.824, 37.6386],
      [55.8124, 37.653],
      [55.7941, 37.6788]
    ]
  ],
  bikeRoutes: [
    [
      [55.7941, 37.6788],
      [55.8012, 37.711],
      [55.7869, 37.7813]
    ],
    [
      [55.7298, 37.6037],
      [55.7104, 37.5426],
      [55.7362, 37.5146]
    ]
  ],
  aLanes: [
    [
      [55.752, 37.6285],
      [55.7666, 37.6598],
      [55.7722, 37.6791]
    ]
  ]
};
