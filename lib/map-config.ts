export type CyclingNetworkLayer = "bikeRoads" | "bikeRoutes" | "aLanes";

export interface CyclingNetworkLine {
  id: string;
  title: string;
  points: Array<[number, number]>;
  minZoom?: number;
}

export type TransitStationType = "metro" | "mcc" | "mcd";

export interface TransitStation {
  id: string;
  name: string;
  type: TransitStationType;
  lat: number;
  lng: number;
  minZoom: number;
}

export const moscowMapDefaultView = {
  center: [55.755, 37.62] as [number, number],
  zoom: 11
};

export const moscowMapBounds: [[number, number], [number, number]] = [
  [55.3, 36.72],
  [56.08, 38.62]
];

export function getMapTileConfig() {
  return {
    url:
      process.env.NEXT_PUBLIC_MAP_TILE_URL ||
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: Number(process.env.NEXT_PUBLIC_MAP_MAX_ZOOM || 20),
    maxNativeZoom: Number(process.env.NEXT_PUBLIC_MAP_MAX_NATIVE_ZOOM || 20),
    className: "map-tile-soft",
    styleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL || null
  };
}

export const moscowCyclingNetwork = {
  bikeRoads: [
    {
      id: "embankments-central",
      title: "Набережные центра",
      points: [
        [55.7088, 37.5483],
        [55.7166, 37.5582],
        [55.7247, 37.5746],
        [55.7298, 37.6037],
        [55.7422, 37.6078],
        [55.752, 37.6285],
        [55.7594, 37.6425],
        [55.7666, 37.6598]
      ]
    },
    {
      id: "gorky-vorobyovy",
      title: "Парк Горького - Воробьевы горы",
      points: [
        [55.7298, 37.6037],
        [55.7243, 37.5908],
        [55.7189, 37.5758],
        [55.7104, 37.5426],
        [55.7165, 37.5266],
        [55.7242, 37.5098]
      ]
    },
    {
      id: "boulevard-ring-north",
      title: "Бульварное кольцо",
      points: [
        [55.7647, 37.6387],
        [55.7636, 37.6298],
        [55.7637, 37.6198],
        [55.7639, 37.6084],
        [55.7604, 37.5957],
        [55.756, 37.5901]
      ],
      minZoom: 12
    },
    {
      id: "boulevard-ring-south",
      title: "Бульварное кольцо",
      points: [
        [55.756, 37.5901],
        [55.7475, 37.5936],
        [55.7437, 37.6044],
        [55.7424, 37.6179],
        [55.7468, 37.6306],
        [55.7568, 37.6313],
        [55.7647, 37.6387]
      ],
      minZoom: 12
    },
    {
      id: "sretenka-chistoprudny",
      title: "Сретенка - Чистые пруды",
      points: [
        [55.7663, 37.6369],
        [55.7692, 37.6315],
        [55.7727, 37.6284],
        [55.777, 37.6325]
      ],
      minZoom: 13
    },
    {
      id: "vdnh-ostankino",
      title: "ВДНХ - Останкино",
      points: [
        [55.821, 37.6411],
        [55.8244, 37.6389],
        [55.8296, 37.6328],
        [55.8366, 37.6225],
        [55.8444, 37.6322]
      ]
    },
    {
      id: "vdnh-botanical",
      title: "ВДНХ - Ботанический сад",
      points: [
        [55.821, 37.6411],
        [55.8305, 37.6491],
        [55.8381, 37.6504],
        [55.8457, 37.6387]
      ],
      minZoom: 12.5
    },
    {
      id: "sokolniki-losiny",
      title: "Сокольники - Лосиный остров",
      points: [
        [55.7893, 37.6797],
        [55.7941, 37.6788],
        [55.8057, 37.6946],
        [55.8126, 37.7206],
        [55.8081, 37.7483],
        [55.7869, 37.7813]
      ]
    },
    {
      id: "izmailovo-network",
      title: "Измайловский парк",
      points: [
        [55.7916, 37.7498],
        [55.7869, 37.7813],
        [55.7775, 37.7996],
        [55.7688, 37.7894],
        [55.7738, 37.7583],
        [55.7916, 37.7498]
      ]
    },
    {
      id: "krylatskoe-loop",
      title: "Крылатское",
      points: [
        [55.7597, 37.4352],
        [55.7674, 37.4213],
        [55.7585, 37.4027],
        [55.7446, 37.4052],
        [55.7362, 37.4251],
        [55.7445, 37.4472],
        [55.7597, 37.4352]
      ]
    },
    {
      id: "filevsky-park",
      title: "Филевский парк",
      points: [
        [55.7482, 37.4857],
        [55.7508, 37.5009],
        [55.7434, 37.5244],
        [55.7338, 37.5378],
        [55.7242, 37.5098]
      ],
      minZoom: 12
    },
    {
      id: "zamoskvorechie",
      title: "Замоскворечье",
      points: [
        [55.7292, 37.6124],
        [55.7337, 37.6243],
        [55.7367, 37.6378],
        [55.741, 37.653],
        [55.7523, 37.6683]
      ],
      minZoom: 12.5
    },
    {
      id: "yauza",
      title: "Яуза",
      points: [
        [55.7523, 37.6683],
        [55.7614, 37.6697],
        [55.7722, 37.6791],
        [55.7824, 37.6887],
        [55.7941, 37.6788]
      ],
      minZoom: 12
    },
    {
      id: "luzhniki-kutuzovsky",
      title: "Лужники - Кутузовский",
      points: [
        [55.7208, 37.563],
        [55.7287, 37.5546],
        [55.7362, 37.5404],
        [55.7436, 37.5655]
      ],
      minZoom: 12
    },
    {
      id: "maryino-kapotnya",
      title: "Юго-восточный коридор",
      points: [
        [55.6495, 37.7431],
        [55.6621, 37.7593],
        [55.677, 37.7704],
        [55.6982, 37.7896],
        [55.7156, 37.8181]
      ]
    },
    {
      id: "southwest-parks",
      title: "Юго-западные парки",
      points: [
        [55.6893, 37.605],
        [55.6769, 37.5838],
        [55.6604, 37.5737],
        [55.6437, 37.5596],
        [55.6265, 37.5431]
      ]
    },
    {
      id: "strogino-shchukino",
      title: "Строгино - Щукино",
      points: [
        [55.8052, 37.3997],
        [55.7971, 37.4254],
        [55.7902, 37.4536],
        [55.785, 37.4762],
        [55.7772, 37.5073]
      ]
    }
  ],
  bikeRoutes: [
    {
      id: "green-ring-west",
      title: "Зеленый маршрут запад",
      points: [
        [55.7362, 37.5146],
        [55.7242, 37.5098],
        [55.7104, 37.5426],
        [55.6893, 37.605],
        [55.684, 37.6288],
        [55.6987, 37.6485]
      ]
    },
    {
      id: "green-ring-east",
      title: "Зеленый маршрут восток",
      points: [
        [55.6987, 37.6485],
        [55.7067, 37.663],
        [55.7292, 37.6987],
        [55.7576, 37.7286],
        [55.7738, 37.7583],
        [55.7916, 37.7498]
      ]
    },
    {
      id: "north-velo-corridor",
      title: "Северный велокоридор",
      points: [
        [55.842, 37.6678],
        [55.8545, 37.6421],
        [55.8644, 37.6049],
        [55.8699, 37.5601],
        [55.8586, 37.5054],
        [55.8321, 37.4872]
      ]
    },
    {
      id: "skolkovo-route",
      title: "Сколковский маршрут",
      points: [
        [55.7362, 37.5146],
        [55.7182, 37.4864],
        [55.7048, 37.4454],
        [55.6988, 37.3594],
        [55.6947, 37.3548]
      ]
    },
    {
      id: "bitsevsky-route",
      title: "Битцевский маршрут",
      points: [
        [55.6893, 37.605],
        [55.6649, 37.6036],
        [55.6437, 37.5952],
        [55.6265, 37.5733],
        [55.6034, 37.5487]
      ]
    },
    {
      id: "balashikha-route",
      title: "Восточный маршрут",
      points: [
        [55.7869, 37.7813],
        [55.777, 37.8284],
        [55.786, 37.8818],
        [55.8033, 37.9478],
        [55.7963, 38.0024]
      ]
    },
    {
      id: "strogino-route",
      title: "Северо-западный маршрут",
      points: [
        [55.7772, 37.5073],
        [55.785, 37.4762],
        [55.7971, 37.4254],
        [55.8052, 37.3997],
        [55.819, 37.3867]
      ],
      minZoom: 12
    },
    {
      id: "center-quiet-route",
      title: "Тихий центр",
      points: [
        [55.7647, 37.6387],
        [55.7601, 37.6465],
        [55.752, 37.6285],
        [55.7451, 37.604],
        [55.756, 37.5901],
        [55.765, 37.605]
      ],
      minZoom: 13
    },
    {
      id: "south-river-route",
      title: "Москва-река юг",
      points: [
        [55.7067, 37.663],
        [55.6914, 37.6765],
        [55.671, 37.6972],
        [55.6495, 37.7431]
      ],
      minZoom: 12
    }
  ],
  aLanes: [
    {
      id: "tverskaya-a-lane",
      title: "А-полоса Тверская",
      points: [
        [55.765, 37.605],
        [55.7597, 37.6112],
        [55.7558, 37.6173],
        [55.752, 37.6285]
      ]
    },
    {
      id: "prospekt-mira-a-lane",
      title: "А-полоса Проспект Мира",
      points: [
        [55.7796, 37.6338],
        [55.795, 37.636],
        [55.8103, 37.6382],
        [55.821, 37.6411]
      ]
    },
    {
      id: "leninsky-a-lane",
      title: "А-полоса Ленинский",
      points: [
        [55.7075, 37.585],
        [55.6893, 37.605],
        [55.6696, 37.5518],
        [55.6482, 37.5266]
      ]
    },
    {
      id: "kutuzovsky-a-lane",
      title: "А-полоса Кутузовский",
      points: [
        [55.7436, 37.5655],
        [55.7406, 37.5333],
        [55.7362, 37.5146],
        [55.7289, 37.4866]
      ]
    },
    {
      id: "varshavskoye-a-lane",
      title: "А-полоса Варшавское",
      points: [
        [55.6893, 37.605],
        [55.6718, 37.6224],
        [55.653, 37.6201],
        [55.6322, 37.6193]
      ]
    },
    {
      id: "volgogradsky-a-lane",
      title: "А-полоса Волгоградский",
      points: [
        [55.741, 37.653],
        [55.7284, 37.6875],
        [55.7156, 37.7322],
        [55.7014, 37.7658]
      ],
      minZoom: 12
    },
    {
      id: "yauza-a-lane",
      title: "А-полоса Русаковская",
      points: [
        [55.7724, 37.679],
        [55.7815, 37.6817],
        [55.7893, 37.6797],
        [55.7997, 37.6799]
      ],
      minZoom: 12
    },
    {
      id: "shosse-enthusiasts-a-lane",
      title: "А-полоса Шоссе Энтузиастов",
      points: [
        [55.7588, 37.6592],
        [55.7597, 37.7044],
        [55.7643, 37.7449],
        [55.7738, 37.7583],
        [55.777, 37.8284]
      ],
      minZoom: 12
    }
  ]
} satisfies Record<CyclingNetworkLayer, CyclingNetworkLine[]>;

export const transitStations: TransitStation[] = [
  { id: "metro-okhotny-ryad", name: "Охотный Ряд", type: "metro", lat: 55.7577, lng: 37.6156, minZoom: 13 },
  { id: "metro-teatralnaya", name: "Театральная", type: "metro", lat: 55.7571, lng: 37.6177, minZoom: 13 },
  { id: "metro-revolution-square", name: "Площадь Революции", type: "metro", lat: 55.7566, lng: 37.6222, minZoom: 13 },
  { id: "metro-lubyanka", name: "Лубянка", type: "metro", lat: 55.7597, lng: 37.6272, minZoom: 13 },
  { id: "metro-arbatskaya", name: "Арбатская", type: "metro", lat: 55.7522, lng: 37.6006, minZoom: 13 },
  { id: "metro-park-kultury", name: "Парк культуры", type: "metro", lat: 55.7357, lng: 37.5947, minZoom: 13 },
  { id: "metro-oktyabrskaya", name: "Октябрьская", type: "metro", lat: 55.7292, lng: 37.6124, minZoom: 13 },
  { id: "metro-kropotkinskaya", name: "Кропоткинская", type: "metro", lat: 55.7451, lng: 37.604, minZoom: 13 },
  { id: "metro-chistye-prudy", name: "Чистые пруды", type: "metro", lat: 55.7647, lng: 37.6387, minZoom: 13 },
  { id: "metro-sretensky", name: "Сретенский бульвар", type: "metro", lat: 55.7661, lng: 37.6367, minZoom: 13 },
  { id: "metro-kitay-gorod", name: "Китай-город", type: "metro", lat: 55.7568, lng: 37.6313, minZoom: 13 },
  { id: "metro-komsomolskaya", name: "Комсомольская", type: "metro", lat: 55.7753, lng: 37.6562, minZoom: 13 },
  { id: "metro-belorusskaya", name: "Белорусская", type: "metro", lat: 55.7766, lng: 37.5835, minZoom: 13 },
  { id: "metro-mayakovskaya", name: "Маяковская", type: "metro", lat: 55.769, lng: 37.5963, minZoom: 13 },
  { id: "metro-pushkinskaya", name: "Пушкинская", type: "metro", lat: 55.765, lng: 37.605, minZoom: 13 },
  { id: "metro-taganskaya", name: "Таганская", type: "metro", lat: 55.741, lng: 37.653, minZoom: 13 },
  { id: "metro-kievskaya", name: "Киевская", type: "metro", lat: 55.7436, lng: 37.5655, minZoom: 13 },
  { id: "metro-kurskaya", name: "Курская", type: "metro", lat: 55.7588, lng: 37.6592, minZoom: 13 },
  { id: "metro-baumanskaya", name: "Бауманская", type: "metro", lat: 55.7724, lng: 37.679, minZoom: 13 },
  { id: "metro-prospekt-mira", name: "Проспект Мира", type: "metro", lat: 55.7796, lng: 37.6338, minZoom: 13 },
  { id: "metro-vdnh", name: "ВДНХ", type: "metro", lat: 55.821, lng: 37.6411, minZoom: 12.7 },
  { id: "metro-sokolniki", name: "Сокольники", type: "metro", lat: 55.7893, lng: 37.6797, minZoom: 13 },
  { id: "metro-izmaylovskaya", name: "Измайловская", type: "metro", lat: 55.7886, lng: 37.7502, minZoom: 13 },
  { id: "metro-krylatskoe", name: "Крылатское", type: "metro", lat: 55.7567, lng: 37.4081, minZoom: 13 },
  { id: "metro-novokosino", name: "Новокосино", type: "metro", lat: 55.7451, lng: 37.8641, minZoom: 12.8 },
  { id: "metro-vykhino", name: "Выхино", type: "metro", lat: 55.7156, lng: 37.8181, minZoom: 12.8 },
  { id: "mcc-luzhniki", name: "Лужники", type: "mcc", lat: 55.7208, lng: 37.563, minZoom: 13 },
  { id: "mcc-kutuzovskaya", name: "Кутузовская", type: "mcc", lat: 55.7406, lng: 37.5333, minZoom: 13 },
  { id: "mcc-delovoy", name: "Деловой центр", type: "mcc", lat: 55.7476, lng: 37.532, minZoom: 13 },
  { id: "mcc-horoshevo", name: "Хорошево", type: "mcc", lat: 55.7772, lng: 37.5073, minZoom: 13 },
  { id: "mcc-rostokino", name: "Ростокино", type: "mcc", lat: 55.842, lng: 37.6678, minZoom: 12.8 },
  { id: "mcc-botanical", name: "Ботанический сад", type: "mcc", lat: 55.8457, lng: 37.6387, minZoom: 12.8 },
  { id: "mcc-izmailovo", name: "Измайлово", type: "mcc", lat: 55.7886, lng: 37.7428, minZoom: 13 },
  { id: "mcc-avtozavodskaya", name: "Автозаводская", type: "mcc", lat: 55.7067, lng: 37.663, minZoom: 13 },
  { id: "mcc-zil", name: "ЗИЛ", type: "mcc", lat: 55.6987, lng: 37.6485, minZoom: 13 },
  { id: "mcc-krymskaya", name: "Крымская", type: "mcc", lat: 55.6893, lng: 37.605, minZoom: 13 },
  { id: "mcc-gagarina", name: "Площадь Гагарина", type: "mcc", lat: 55.7075, lng: 37.585, minZoom: 13 },
  { id: "mcd-dmitrovskaya", name: "Дмитровская", type: "mcd", lat: 55.808, lng: 37.5814, minZoom: 13 },
  { id: "mcd-savelovskaya", name: "Савеловская", type: "mcd", lat: 55.794, lng: 37.5886, minZoom: 13 },
  { id: "mcd-belorusskaya", name: "Белорусская", type: "mcd", lat: 55.7771, lng: 37.5807, minZoom: 13 },
  { id: "mcd-kurskaya", name: "Курская", type: "mcd", lat: 55.7576, lng: 37.6618, minZoom: 13 },
  { id: "mcd-kalanchevskaya", name: "Каланчевская", type: "mcd", lat: 55.776, lng: 37.6517, minZoom: 13 },
  { id: "mcd-testovskaya", name: "Тестовская", type: "mcd", lat: 55.7536, lng: 37.5314, minZoom: 13 },
  { id: "mcd-tsaritsyno", name: "Царицыно", type: "mcd", lat: 55.6215, lng: 37.6693, minZoom: 12.8 },
  { id: "mcd-skolkovo", name: "Сколково", type: "mcd", lat: 55.6947, lng: 37.3548, minZoom: 12.8 }
];
