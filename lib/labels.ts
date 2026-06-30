import type {
  BikeType,
  CyclingLevel,
  MapPointType,
  RegistrationStatus,
  RideType
} from "@/lib/types";

export const levelLabels: Record<CyclingLevel, string> = {
  beginner: "Новичкам",
  casual: "Спокойно",
  intermediate: "Средний",
  advanced: "Сильно",
  sport: "Спорт"
};

export const bikeTypeLabels: Record<BikeType, string> = {
  road: "Шоссе",
  gravel: "Гравел",
  mtb: "MTB",
  city: "Городской",
  fixed: "Fixed",
  any: "Любой"
};

export const rideTypeLabels: Record<RideType, string> = {
  coffee: "Коферайд",
  city: "Город",
  training: "Тренировка",
  gravel: "Гравел",
  road: "Шоссе",
  night: "Ночной",
  social: "Социальный",
  long_ride: "Длинный"
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
