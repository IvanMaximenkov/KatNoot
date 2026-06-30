import { randomUUID } from "crypto";
import { buildDemoData, demoUser } from "@/lib/demo-data";
import type {
  BikeType,
  Club,
  ClubMembership,
  CyclingLevel,
  MapPoint,
  RegistrationStatus,
  Ride,
  RideRegistration,
  TelegramMiniAppUser,
  User
} from "@/lib/types";

type Store = ReturnType<typeof buildDemoData>;

type GlobalStore = typeof globalThis & {
  __katnutStore?: Store;
};

function getStore() {
  const globalStore = globalThis as GlobalStore;
  if (!globalStore.__katnutStore) {
    globalStore.__katnutStore = buildDemoData();
  }

  return globalStore.__katnutStore;
}

export function listMockClubs() {
  return [...getStore().clubs];
}

export function listMockClubMemberships() {
  return [...getStore().clubMemberships];
}

export function listMockUsers() {
  return [...getStore().users];
}

export function listMockRides() {
  return [...getStore().rides].sort(
    (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
  );
}

export function listMockMapPoints() {
  return [...getStore().mapPoints];
}

export function listMockRegistrations() {
  return [...getStore().registrations];
}

export function getMockUser(id = demoUser.id) {
  return getStore().users.find((user) => user.id === id) ?? demoUser;
}

export function ensureMockDemoUser() {
  const store = getStore();
  const existing = store.users.find((user) => user.id === demoUser.id);
  if (existing) {
    return existing;
  }
  store.users.push(demoUser);
  return demoUser;
}

export function upsertMockTelegramUser(telegramUser: TelegramMiniAppUser) {
  const store = getStore();
  const telegramId = String(telegramUser.id);
  const existing = store.users.find((user) => user.telegram_id === telegramId);

  if (existing) {
    existing.username = telegramUser.username ?? existing.username;
    existing.first_name = telegramUser.first_name || existing.first_name;
    existing.photo_url = telegramUser.photo_url ?? existing.photo_url;
    return existing;
  }

  const user: User = {
    id: randomUUID(),
    telegram_id: telegramId,
    username: telegramUser.username ?? null,
    first_name: telegramUser.first_name || "Велосипедист",
    photo_url: telegramUser.photo_url ?? null,
    cycling_level: "casual",
    bike_type: "any",
    preferred_pace_min: 16,
    preferred_pace_max: 24,
    created_at: new Date().toISOString()
  };

  store.users.push(user);
  return user;
}

export type CreateRideData = Omit<Ride, "id" | "created_at" | "status"> & {
  status?: Ride["status"];
};

export function createMockRide(data: CreateRideData) {
  const store = getStore();
  const ride: Ride = {
    ...data,
    id: randomUUID(),
    status: data.status ?? "active",
    created_at: new Date().toISOString()
  };
  store.rides.unshift(ride);
  return ride;
}

export function upsertMockRegistration(
  rideId: string,
  userId: string,
  status: RegistrationStatus
) {
  const store = getStore();
  const existing = store.registrations.find(
    (registration) => registration.ride_id === rideId && registration.user_id === userId
  );

  if (existing) {
    existing.status = status;
    return existing;
  }

  const registration: RideRegistration = {
    id: randomUUID(),
    ride_id: rideId,
    user_id: userId,
    status,
    created_at: new Date().toISOString()
  };

  store.registrations.push(registration);
  return registration;
}

export function updateMockUserPreferences(
  id: string,
  data: Partial<{
    cycling_level: CyclingLevel;
    bike_type: BikeType;
    preferred_pace_min: number;
    preferred_pace_max: number;
  }>
) {
  const user = getStore().users.find((candidate) => candidate.id === id);
  if (!user) {
    return null;
  }

  Object.assign(user, data);
  return user;
}

export function getMockClubBySlug(slug: string): Club | null {
  return getStore().clubs.find((club) => club.slug === slug) ?? null;
}

export function getMockRideById(id: string): Ride | null {
  return getStore().rides.find((ride) => ride.id === id) ?? null;
}

export function getMockMapPointById(id: string): MapPoint | null {
  return getStore().mapPoints.find((point) => point.id === id) ?? null;
}
