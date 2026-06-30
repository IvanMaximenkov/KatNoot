import type {
  BikeType,
  CyclingLevel,
  MapPointType,
  RegistrationStatus,
  RideType
} from "@/lib/types";

export const levelLabels: Record<CyclingLevel, string> = {
  beginner: "Новичок",
  casual: "Спокойный",
  intermediate: "Средний",
  advanced: "Уверенный",
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
  night: "Ночной"
};

export const levelTagLabels: Record<CyclingLevel, string> = {
  beginner: "для новичков",
  casual: "спокойный",
  intermediate: "средний",
  advanced: "уверенный",
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
  night: "ночной"
};

export const registrationLabels: Record<RegistrationStatus, string> = {
  going: "Едет",
  maybe: "Возможно",
  cancelled: "Отменил"
};

export const mapPointLabels: Record<MapPointType, string> = {
  bike_lane: "Велодорожка",
  scenic: "Красивое место",
  repair: "Ремонт",
  water: "Вода",
  cafe: "Кафе",
  warning: "Осторожно"
};

export const quickFilters = [
  "Сегодня",
  "Завтра",
  "Выходные",
  "Новичкам",
  "Коферайды",
  "Шоссе",
  "Гравел",
  "Ночные"
] as const;

export type QuickFilter = (typeof quickFilters)[number];
