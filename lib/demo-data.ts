import type {
  Club,
  ClubMembership,
  MapPoint,
  Ride,
  RideRegistration,
  User
} from "@/lib/types";

const nowIso = () => new Date().toISOString();
const moscow = {
  gorky: { lat: 55.7298, lng: 37.6037 },
  vorobyovy: { lat: 55.7104, lng: 37.5426 },
  krylatskoe: { lat: 55.7597, lng: 37.4352 },
  vdnh: { lat: 55.824, lng: 37.6386 },
  sokolniki: { lat: 55.7941, lng: 37.6788 },
  zaryadye: { lat: 55.752, lng: 37.6285 }
};

function dateAt(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const demoUser: User = {
  id: "00000000-0000-4000-8000-000000000001",
  telegram_id: "demo-browser",
  username: "demo_rider",
  first_name: "Демо райдер",
  photo_url: null,
  cycling_level: "casual",
  bike_type: "gravel",
  preferred_pace_min: 18,
  preferred_pace_max: 24,
  created_at: nowIso()
};

export function buildDemoData() {
  const createdAt = nowIso();
  const clubs: Club[] = [
    {
      id: "10000000-0000-4000-8000-000000000001",
      name: "Easy Coffee Ride",
      slug: "easy-coffee-ride",
      description:
        "Спокойные коферайды по набережным и паркам, без гонки и с обязательной остановкой на хороший фильтр.",
      logo_url: null,
      telegram_url: "https://t.me/easy_coffee_ride",
      city: "Москва",
      sport_type: "cycling",
      tags: ["кофе", "новичкам", "город"],
      created_at: createdAt
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      name: "Moscow Gravel Crew",
      slug: "moscow-gravel-crew",
      description:
        "Гравел-поездки вокруг Москвы: парки, просеки, легкие грунты и разговоры на привалах.",
      logo_url: null,
      telegram_url: "https://t.me/moscow_gravel_crew",
      city: "Москва",
      sport_type: "cycling",
      tags: ["гравел", "лес", "выходные"],
      created_at: createdAt
    },
    {
      id: "10000000-0000-4000-8000-000000000003",
      name: "Night City Cycling",
      slug: "night-city-cycling",
      description:
        "Ночные городские заезды с красивыми видами, подсветкой и аккуратным темпом колонны.",
      logo_url: null,
      telegram_url: "https://t.me/night_city_cycling",
      city: "Москва",
      sport_type: "cycling",
      tags: ["ночь", "прогулка", "свет"],
      created_at: createdAt
    },
    {
      id: "10000000-0000-4000-8000-000000000004",
      name: "Newbie Bike Moscow",
      slug: "newbie-bike-moscow",
      description:
        "Клуб для тех, кто только втягивается: короткие дистанции, no-drop и помощь с базовой техникой.",
      logo_url: null,
      telegram_url: "https://t.me/newbie_bike_moscow",
      city: "Москва",
      sport_type: "cycling",
      tags: ["новичкам", "no-drop", "город"],
      created_at: createdAt
    },
    {
      id: "10000000-0000-4000-8000-000000000005",
      name: "Road Tempo Club",
      slug: "road-tempo-club",
      description:
        "Шоссейные тренировки для тех, кто любит ровную смену, понятный план и бодрый темп.",
      logo_url: null,
      telegram_url: "https://t.me/road_tempo_club",
      city: "Москва",
      sport_type: "cycling",
      tags: ["шоссе", "темп", "тренировки"],
      created_at: createdAt
    }
  ];

  const users: User[] = [
    demoUser,
    {
      id: "00000000-0000-4000-8000-000000000002",
      telegram_id: "1002",
      username: "lena_pedals",
      first_name: "Лена",
      photo_url: null,
      cycling_level: "intermediate",
      bike_type: "road",
      preferred_pace_min: 24,
      preferred_pace_max: 30,
      created_at: createdAt
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      telegram_id: "1003",
      username: "max_gravel",
      first_name: "Макс",
      photo_url: null,
      cycling_level: "advanced",
      bike_type: "gravel",
      preferred_pace_min: 22,
      preferred_pace_max: 28,
      created_at: createdAt
    },
    {
      id: "00000000-0000-4000-8000-000000000004",
      telegram_id: "1004",
      username: "anya_city",
      first_name: "Аня",
      photo_url: null,
      cycling_level: "beginner",
      bike_type: "city",
      preferred_pace_min: 14,
      preferred_pace_max: 19,
      created_at: createdAt
    }
  ];

  const clubMemberships: ClubMembership[] = [
    {
      id: "50000000-0000-4000-8000-000000000001",
      club_id: clubs[0].id,
      user_id: users[1].id,
      role: "admin",
      created_at: createdAt
    },
    {
      id: "50000000-0000-4000-8000-000000000002",
      club_id: clubs[2].id,
      user_id: users[1].id,
      role: "organizer",
      created_at: createdAt
    },
    {
      id: "50000000-0000-4000-8000-000000000003",
      club_id: clubs[1].id,
      user_id: users[2].id,
      role: "organizer",
      created_at: createdAt
    },
    {
      id: "50000000-0000-4000-8000-000000000004",
      club_id: clubs[3].id,
      user_id: users[3].id,
      role: "admin",
      created_at: createdAt
    }
  ];

  const rides: Ride[] = [
    {
      id: "20000000-0000-4000-8000-000000000001",
      club_id: clubs[0].id,
      creator_user_id: demoUser.id,
      title: "Коферайд по набережным",
      description:
        "Легкий круг от Парка Горького до Красного Октября и обратно. Заезжаем на кофе, едем разговорным темпом.",
      date_time: dateAt(0, 19, 30),
      start_location_name: "Парк Горького, главный вход",
      start_lat: moscow.gorky.lat,
      start_lng: moscow.gorky.lng,
      finish_location_name: "Парк Горького",
      finish_lat: moscow.gorky.lat,
      finish_lng: moscow.gorky.lng,
      distance_km: 22,
      pace_min_kmh: 16,
      pace_max_kmh: 22,
      level: "casual",
      ride_type: "coffee",
      bike_type: "any",
      no_drop: true,
      max_participants: 18,
      rules: "Шлем желателен, держим дистанцию, на набережных не устраиваем гонку.",
      what_to_bring: "Вода, замок, свет на обратную дорогу.",
      route_url: "https://www.openstreetmap.org/#map=13/55.7298/37.6037",
      telegram_chat_url: "https://t.me/easy_coffee_ride",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000002",
      club_id: clubs[3].id,
      creator_user_id: users[3].id,
      title: "Новичковый заезд 25 км",
      description:
        "Очень понятный городской маршрут для первого группового выезда. Перед стартом коротко объясним жесты и правила колонны.",
      date_time: dateAt(1, 11),
      start_location_name: "ВДНХ, арка главного входа",
      start_lat: moscow.vdnh.lat,
      start_lng: moscow.vdnh.lng,
      finish_location_name: "Сокольники",
      finish_lat: moscow.sokolniki.lat,
      finish_lng: moscow.sokolniki.lng,
      distance_km: 25,
      pace_min_kmh: 14,
      pace_max_kmh: 18,
      level: "beginner",
      ride_type: "city",
      bike_type: "any",
      no_drop: true,
      max_participants: 20,
      rules: "Едем одной группой, ждём всех, без резких перестроений.",
      what_to_bring: "Исправный велосипед, вода, запасная камера по возможности.",
      route_url: null,
      telegram_chat_url: "https://t.me/newbie_bike_moscow",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000003",
      club_id: clubs[2].id,
      creator_user_id: users[1].id,
      title: "Ночной центр",
      description:
        "Короткий ночной круг через Китай-город, набережные и тихие улицы центра. Свет обязателен.",
      date_time: dateAt(1, 22, 15),
      start_location_name: "Парк Зарядье",
      start_lat: moscow.zaryadye.lat,
      start_lng: moscow.zaryadye.lng,
      finish_location_name: "Парк Зарядье",
      finish_lat: moscow.zaryadye.lat,
      finish_lng: moscow.zaryadye.lng,
      distance_km: 28,
      pace_min_kmh: 18,
      pace_max_kmh: 24,
      level: "intermediate",
      ride_type: "night",
      bike_type: "any",
      no_drop: true,
      max_participants: 16,
      rules: "Передний и задний свет обязательны. Алкоголь после, не до.",
      what_to_bring: "Свет, отражатели, теплая ветровка.",
      route_url: "https://www.openstreetmap.org/#map=14/55.7520/37.6285",
      telegram_chat_url: "https://t.me/night_city_cycling",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000004",
      club_id: clubs[1].id,
      creator_user_id: users[2].id,
      title: "Гравел до Лосиного острова",
      description:
        "Смешанный маршрут: город, парковые дорожки, легкий грунт. Хороший вариант для первого гравела рядом с Москвой.",
      date_time: dateAt(2, 9, 30),
      start_location_name: "Сокольники, круг у фонтана",
      start_lat: moscow.sokolniki.lat,
      start_lng: moscow.sokolniki.lng,
      finish_location_name: "Сокольники",
      finish_lat: moscow.sokolniki.lat,
      finish_lng: moscow.sokolniki.lng,
      distance_km: 48,
      pace_min_kmh: 18,
      pace_max_kmh: 24,
      level: "intermediate",
      ride_type: "gravel",
      bike_type: "gravel",
      no_drop: true,
      max_participants: 14,
      rules: "Покрышки от 35 мм приветствуются, на сложных местах ждём группу.",
      what_to_bring: "Камера, насос, перекус, вода на 2 часа.",
      route_url: null,
      telegram_chat_url: "https://t.me/moscow_gravel_crew",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000005",
      club_id: clubs[4].id,
      creator_user_id: users[1].id,
      title: "Темповая тренировка в Крылатском",
      description:
        "Ровная работа по кругам: разминка, 4 темповых отрезка, заминка. Для тех, кто уверенно держит колесо.",
      date_time: dateAt(2, 8),
      start_location_name: "Гребной канал, северный вход",
      start_lat: moscow.krylatskoe.lat,
      start_lng: moscow.krylatskoe.lng,
      finish_location_name: "Гребной канал",
      finish_lat: moscow.krylatskoe.lat,
      finish_lng: moscow.krylatskoe.lng,
      distance_km: 55,
      pace_min_kmh: 28,
      pace_max_kmh: 34,
      level: "advanced",
      ride_type: "training",
      bike_type: "road",
      no_drop: false,
      max_participants: 12,
      rules: "Шоссейный велосипед, шлем, умение ехать в группе.",
      what_to_bring: "Две фляги, питание, камера.",
      route_url: "https://www.openstreetmap.org/#map=13/55.7597/37.4352",
      telegram_chat_url: "https://t.me/road_tempo_club",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000006",
      club_id: clubs[0].id,
      creator_user_id: demoUser.id,
      title: "Сколково лайтово",
      description:
        "Выезд за город без спортивной злости: ровный асфальт, остановка на кофе и возвращение электричкой по желанию.",
      date_time: dateAt(3, 10),
      start_location_name: "Парк Победы",
      start_lat: 55.7362,
      start_lng: 37.5146,
      finish_location_name: "Сколково",
      finish_lat: 55.6988,
      finish_lng: 37.3594,
      distance_km: 42,
      pace_min_kmh: 20,
      pace_max_kmh: 25,
      level: "casual",
      ride_type: "city",
      bike_type: "any",
      no_drop: true,
      max_participants: 18,
      rules: "Без отрывов, на выездах из города едем компактно.",
      what_to_bring: "Вода, перекус, карта Тройка на всякий случай.",
      route_url: null,
      telegram_chat_url: "https://t.me/easy_coffee_ride",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000007",
      club_id: clubs[3].id,
      creator_user_id: users[3].id,
      title: "Парк Горького — Воробьёвы",
      description:
        "Классика для уверенного старта сезона: набережные, смотровая, короткая пауза и возвращение обратно.",
      date_time: dateAt(4, 19),
      start_location_name: "Парк Горького, фонтан",
      start_lat: moscow.gorky.lat,
      start_lng: moscow.gorky.lng,
      finish_location_name: "Парк Горького",
      finish_lat: moscow.gorky.lat,
      finish_lng: moscow.gorky.lng,
      distance_km: 20,
      pace_min_kmh: 15,
      pace_max_kmh: 20,
      level: "beginner",
      ride_type: "city",
      bike_type: "any",
      no_drop: true,
      max_participants: 22,
      rules: "Подойдет для первого группового выезда.",
      what_to_bring: "Вода, шлем, хорошее настроение.",
      route_url: "https://www.openstreetmap.org/#map=13/55.7104/37.5426",
      telegram_chat_url: "https://t.me/newbie_bike_moscow",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000008",
      club_id: clubs[1].id,
      creator_user_id: users[2].id,
      title: "Зелёное кольцо: кусок маршрута",
      description:
        "Едем связку парков и тихих улиц, тестируем зеленый коридор без полного кольца.",
      date_time: dateAt(5, 10, 30),
      start_location_name: "ВДНХ",
      start_lat: moscow.vdnh.lat,
      start_lng: moscow.vdnh.lng,
      finish_location_name: "Измайловский парк",
      finish_lat: 55.7869,
      finish_lng: 37.7813,
      distance_km: 36,
      pace_min_kmh: 18,
      pace_max_kmh: 23,
      level: "intermediate",
      ride_type: "gravel",
      bike_type: "gravel",
      no_drop: true,
      max_participants: 16,
      rules: "Часть маршрута может быть по грунту после дождя.",
      what_to_bring: "Запасная камера, вода, перекус.",
      route_url: null,
      telegram_chat_url: "https://t.me/moscow_gravel_crew",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000009",
      club_id: clubs[2].id,
      creator_user_id: demoUser.id,
      title: "Закат на смотровой",
      description:
        "Встречаемся после работы, едем через набережные на смотровую и возвращаемся по светлому городу.",
      date_time: dateAt(0, 20),
      start_location_name: "Крымский мост",
      start_lat: 55.7337,
      start_lng: 37.5993,
      finish_location_name: "Воробьёвы горы",
      finish_lat: moscow.vorobyovy.lat,
      finish_lng: moscow.vorobyovy.lng,
      distance_km: 24,
      pace_min_kmh: 18,
      pace_max_kmh: 23,
      level: "casual",
      ride_type: "night",
      bike_type: "any",
      no_drop: true,
      max_participants: 15,
      rules: "Свет обязателен после заката.",
      what_to_bring: "Ветровка и задняя мигалка.",
      route_url: null,
      telegram_chat_url: "https://t.me/night_city_cycling",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000010",
      club_id: clubs[4].id,
      creator_user_id: users[1].id,
      title: "Шоссейный ровный час",
      description:
        "Час ровной групповой работы без сюрпризов. Подойдет тем, кто уже ездит в сменах.",
      date_time: dateAt(6, 7, 30),
      start_location_name: "Крылатское, велотрек",
      start_lat: moscow.krylatskoe.lat,
      start_lng: moscow.krylatskoe.lng,
      finish_location_name: "Крылатское",
      finish_lat: moscow.krylatskoe.lat,
      finish_lng: moscow.krylatskoe.lng,
      distance_km: 38,
      pace_min_kmh: 30,
      pace_max_kmh: 36,
      level: "sport",
      ride_type: "road",
      bike_type: "road",
      no_drop: false,
      max_participants: 10,
      rules: "Без лежаков, шлем обязателен.",
      what_to_bring: "Питание на тренировку и две фляги.",
      route_url: null,
      telegram_chat_url: "https://t.me/road_tempo_club",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000011",
      club_id: clubs[0].id,
      creator_user_id: users[3].id,
      title: "Утренний фильтр у Яузы",
      description:
        "Мягкий старт дня: короткая Яуза, кофе и разъезд по делам.",
      date_time: dateAt(1, 8, 15),
      start_location_name: "Сад Баумана",
      start_lat: 55.7666,
      start_lng: 37.6598,
      finish_location_name: "Artplay",
      finish_lat: 55.7523,
      finish_lng: 37.6683,
      distance_km: 18,
      pace_min_kmh: 15,
      pace_max_kmh: 20,
      level: "casual",
      ride_type: "coffee",
      bike_type: "any",
      no_drop: true,
      max_participants: 12,
      rules: "Коротко и дружелюбно.",
      what_to_bring: "Замок для кофейной остановки.",
      route_url: null,
      telegram_chat_url: "https://t.me/easy_coffee_ride",
      status: "active",
      created_at: createdAt
    },
    {
      id: "20000000-0000-4000-8000-000000000012",
      club_id: clubs[1].id,
      creator_user_id: users[2].id,
      title: "Гравел-проба для города",
      description:
        "Легкая проверка гравела: немного асфальта, немного парковых дорожек, без дальнего выезда.",
      date_time: dateAt(2, 17),
      start_location_name: "Измайловский парк, северный вход",
      start_lat: 55.7916,
      start_lng: 37.7498,
      finish_location_name: "Измайловский парк",
      finish_lat: 55.7916,
      finish_lng: 37.7498,
      distance_km: 30,
      pace_min_kmh: 17,
      pace_max_kmh: 22,
      level: "casual",
      ride_type: "gravel",
      bike_type: "gravel",
      no_drop: true,
      max_participants: 14,
      rules: "Подходит для гравела и MTB.",
      what_to_bring: "Вода, запаска, желание не спешить.",
      route_url: null,
      telegram_chat_url: "https://t.me/moscow_gravel_crew",
      status: "active",
      created_at: createdAt
    }
  ];

  const registrations: RideRegistration[] = [
    {
      id: "30000000-0000-4000-8000-000000000001",
      ride_id: rides[0].id,
      user_id: users[1].id,
      status: "going",
      created_at: createdAt
    },
    {
      id: "30000000-0000-4000-8000-000000000002",
      ride_id: rides[0].id,
      user_id: users[2].id,
      status: "maybe",
      created_at: createdAt
    },
    {
      id: "30000000-0000-4000-8000-000000000003",
      ride_id: rides[1].id,
      user_id: demoUser.id,
      status: "going",
      created_at: createdAt
    },
    {
      id: "30000000-0000-4000-8000-000000000004",
      ride_id: rides[2].id,
      user_id: users[3].id,
      status: "going",
      created_at: createdAt
    },
    {
      id: "30000000-0000-4000-8000-000000000005",
      ride_id: rides[4].id,
      user_id: users[2].id,
      status: "going",
      created_at: createdAt
    },
    {
      id: "30000000-0000-4000-8000-000000000006",
      ride_id: rides[6].id,
      user_id: users[1].id,
      status: "going",
      created_at: createdAt
    }
  ];

  const mapPoints: MapPoint[] = [
    {
      id: "40000000-0000-4000-8000-000000000001",
      title: "Велополоса на Фрунзенской",
      description: "Удобный участок для спокойного движения вдоль набережной.",
      type: "bike_lane",
      lat: 55.7229,
      lng: 37.5869,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000002",
      title: "Смотровая Воробьёвых",
      description: "Классическая точка для фото и короткой паузы.",
      type: "scenic",
      lat: moscow.vorobyovy.lat,
      lng: moscow.vorobyovy.lng,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000003",
      title: "Мастерская у Бауманской",
      description: "Можно быстро подкачать колесо и купить камеру.",
      type: "repair",
      lat: 55.7722,
      lng: 37.6791,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000004",
      title: "Питьевой фонтан у Музеона",
      description: "Удобно пополнить фляги перед набережной.",
      type: "water",
      lat: 55.735,
      lng: 37.6067,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000005",
      title: "Кофе у Крымского",
      description: "Популярная остановка перед вечерним кругом.",
      type: "cafe",
      lat: 55.7332,
      lng: 37.5998,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000006",
      title: "Узкий участок на Яузе",
      description: "Много пешеходов вечером, лучше сбавить скорость.",
      type: "warning",
      lat: 55.766,
      lng: 37.6697,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000007",
      title: "Велодорожка ВДНХ",
      description: "Хорошее место для новичковой разминки.",
      type: "bike_lane",
      lat: 55.8244,
      lng: 37.6389,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000008",
      title: "Кафе в Сокольниках",
      description: "Точка сбора перед гравелом в Лосиный остров.",
      type: "cafe",
      lat: 55.7937,
      lng: 37.6769,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000009",
      title: "Парк Победы: широкий старт",
      description: "Удобно собрать большую группу перед выездом на запад.",
      type: "scenic",
      lat: 55.7362,
      lng: 37.5146,
      created_at: createdAt
    },
    {
      id: "40000000-0000-4000-8000-000000000010",
      title: "Крылатское: спортивный круг",
      description: "Следите за быстрыми группами и держите правую сторону.",
      type: "warning",
      lat: moscow.krylatskoe.lat,
      lng: moscow.krylatskoe.lng,
      created_at: createdAt
    }
  ];

  return { clubs, users, clubMemberships, rides, registrations, mapPoints };
}
