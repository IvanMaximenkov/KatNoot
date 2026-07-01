import type {
  BikeType,
  ClubApplicationStatus,
  ClubRole,
  ClubStatus,
  CyclingLevel,
  GlobalRole,
  MapPointType,
  RegistrationStatus,
  RideStatus,
  RideType
} from "@/lib/types";

export const levelLabels: Record<CyclingLevel, string> = {
  beginner: "Новичок",
  casual: "Спокойный",
  easy: "Легкий",
  intermediate: "Средний",
  medium: "Средний",
  advanced: "Уверенный",
  hard: "Сложный",
  sport: "Спортивный"
};

export const bikeTypeLabels: Record<BikeType, string> = {
  road: "Шоссейный",
  gravel: "Гравийный",
  mtb: "MTB",
  city: "Городской",
  fixed: "Fixed",
  any: "Любой"
};

export const rideTypeLabels: Record<RideType, string> = {
  coffee: "Коферайд",
  city: "Прогулка",
  training: "Тренировка",
  gravel: "Гравел",
  road: "Шоссе",
  night: "Ночной",
  social: "Общение",
  mtb: "MTB",
  long: "Длинный"
};

export const levelTagLabels: Record<CyclingLevel, string> = {
  beginner: "для новичков",
  casual: "спокойный",
  easy: "легкий",
  intermediate: "средний",
  medium: "средний",
  advanced: "уверенный",
  hard: "сложный",
  sport: "спортивный"
};

export const bikeTagLabels: Record<BikeType, string> = {
  road: "шоссейный",
  gravel: "гравийный",
  mtb: "MTB",
  city: "городской",
  fixed: "fixed",
  any: "любой"
};

export const rideTypeTagLabels: Record<RideType, string> = {
  coffee: "кофе и общение",
  city: "спокойная прогулка",
  training: "тренировка",
  gravel: "гравийный маршрут",
  road: "шоссе",
  night: "ночной",
  social: "социальный",
  mtb: "MTB",
  long: "длинная дистанция"
};

export const registrationLabels: Record<RegistrationStatus, string> = {
  going: "Едет",
  maybe: "Возможно",
  cancelled: "Отменил"
};

export const globalRoleLabels: Record<GlobalRole, string> = {
  rider: "Райдер",
  verified_organizer: "Проверенный организатор",
  super_admin: "Super admin"
};

export const clubRoleLabels: Record<ClubRole, string> = {
  club_owner: "Владелец клуба",
  club_admin: "Админ клуба",
  club_organizer: "Организатор клуба",
  club_member: "Участник",
  banned: "Заблокирован",
  admin: "Админ клуба",
  organizer: "Организатор клуба",
  member: "Участник"
};

export const clubStatusLabels: Record<ClubStatus, string> = {
  pending: "На модерации",
  active: "Активен",
  rejected: "Отклонен",
  suspended: "Заморожен",
  archived: "Архив"
};

export const clubApplicationStatusLabels: Record<ClubApplicationStatus, string> = {
  pending: "На рассмотрении",
  approved: "Одобрена",
  rejected: "Отклонена"
};

export const rideStatusLabels: Record<RideStatus, string> = {
  draft: "Черновик",
  published: "Опубликован",
  active: "Опубликован",
  cancelled: "Отменен",
  finished: "Завершен",
  archived: "Архив"
};

export const mapPointLabels: Record<MapPointType, string> = {
  bike_lane: "Велодорожка",
  bike_route: "Веломаршрут",
  a_lane: "А-полоса",
  parking: "Велопарковка",
  scenic: "Красивое место",
  repair: "Ремонт",
  water: "Вода",
  cafe: "Кафе",
  warning: "Осторожно",
  dangerous_place: "Опасное место",
  meeting_point: "Точка сбора"
};

export const quickFilters = [
  "Сегодня",
  "Завтра",
  "Выходные",
  "Новичкам",
  "No-drop",
  "Есть маршрут",
  "Рядом со мной",
  "Коферайды",
  "Шоссе",
  "Гравел",
  "Ночные"
] as const;

export type QuickFilter = (typeof quickFilters)[number];
