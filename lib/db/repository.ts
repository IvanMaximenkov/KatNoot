import { demoUser } from "@/lib/demo-data";
import {
  createMockRide,
  ensureMockDemoUser,
  getMockClubBySlug,
  getMockRideById,
  getMockUser,
  listMockClubMemberships,
  listMockClubs,
  listMockMapPoints,
  listMockRegistrations,
  listMockRides,
  listMockUsers,
  type CreateRideData,
  updateMockUserPreferences,
  upsertMockRegistration,
  upsertMockTelegramUser
} from "@/lib/db/mock-store";
import { createSupabaseAdminClient, hasSupabaseEnv } from "@/lib/supabase/admin";
import type {
  BikeType,
  Club,
  ClubMembership,
  ClubWithStats,
  CyclingLevel,
  MapPoint,
  RegistrationStatus,
  Ride,
  RideDetail,
  RideRegistration,
  RideOrganizer,
  RideWithClub,
  TelegramMiniAppUser,
  User
} from "@/lib/types";

const activeStatuses = new Set(["going", "maybe"]);
const organizerRoles = new Set<ClubMembership["role"]>(["admin", "organizer"]);

export function isUsingSupabase() {
  return hasSupabaseEnv();
}

async function getSupabaseRows<T>(table: string, order?: { column: string; ascending?: boolean }) {
  const client = createSupabaseAdminClient();
  if (!client) {
    return null;
  }

  let query = client.from(table).select("*");
  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? true });
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as T[];
}

async function getBaseData() {
  if (!isUsingSupabase()) {
    return {
      clubs: listMockClubs(),
      clubMemberships: listMockClubMemberships(),
      users: listMockUsers(),
      rides: listMockRides(),
      registrations: listMockRegistrations(),
      mapPoints: listMockMapPoints()
    };
  }

  const [clubs, clubMemberships, users, rides, registrations, mapPoints] = await Promise.all([
    getSupabaseRows<Club>("clubs", { column: "name" }),
    getSupabaseRows<ClubMembership>("club_memberships", { column: "created_at" }),
    getSupabaseRows<User>("users", { column: "created_at" }),
    getSupabaseRows<Ride>("rides", { column: "date_time" }),
    getSupabaseRows<RideRegistration>("ride_registrations", { column: "created_at" }),
    getSupabaseRows<MapPoint>("map_points", { column: "created_at" })
  ]);

  return {
    clubs: clubs ?? [],
    clubMemberships: clubMemberships ?? [],
    users: users ?? [],
    rides: rides ?? [],
    registrations: registrations ?? [],
    mapPoints: mapPoints ?? []
  };
}

function enrichRides(
  rides: Ride[],
  clubs: Club[],
  registrations: RideRegistration[],
  users: User[]
): RideWithClub[] {
  return rides
    .filter((ride) => ride.status !== "cancelled")
    .map((ride) => {
      const club = ride.club_id
        ? clubs.find((candidate) => candidate.id === ride.club_id) ?? null
        : null;
      if (ride.club_id && !club) {
        return null;
      }
      const creator = users.find((candidate) => candidate.id === ride.creator_user_id);
      const organizer: RideOrganizer = club
        ? {
            type: "club",
            name: club.name,
            description: club.description,
            href: `/clubs/${club.slug}`,
            photo_url: club.logo_url
          }
        : {
            type: "rider",
            name: creator?.first_name ?? "Велосипедист",
            description: "Личный заезд от райдера. Запись и детали доступны в карточке старта.",
            href: null,
            photo_url: creator?.photo_url ?? null
          };

      const rideRegistrations = registrations.filter(
        (registration) => registration.ride_id === ride.id
      );
      return {
        ...ride,
        club,
        organizer,
        participant_count: rideRegistrations.filter(
          (registration) => registration.status === "going"
        ).length,
        maybe_count: rideRegistrations.filter((registration) => registration.status === "maybe")
          .length
      };
    })
    .filter((ride): ride is RideWithClub => Boolean(ride))
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
}

export async function listRides() {
  const { rides, clubs, registrations, users } = await getBaseData();
  return enrichRides(rides, clubs, registrations, users);
}

export async function listMapPoints() {
  const { mapPoints } = await getBaseData();
  return mapPoints;
}

export async function listClubMemberships() {
  const { clubMemberships } = await getBaseData();
  return clubMemberships;
}

export async function listOrganizerClubs(userId: string) {
  const { clubs, clubMemberships } = await getBaseData();
  const allowedClubIds = new Set(
    clubMemberships
      .filter((membership) => membership.user_id === userId && organizerRoles.has(membership.role))
      .map((membership) => membership.club_id)
  );

  return clubs.filter((club) => allowedClubIds.has(club.id));
}

export async function canCreateRideForClub(userId: string, clubId: string) {
  const organizerClubs = await listOrganizerClubs(userId);
  return organizerClubs.some((club) => club.id === clubId);
}

export async function listClubs(): Promise<ClubWithStats[]> {
  const { clubs, rides } = await getBaseData();
  const now = Date.now();

  return clubs.map((club) => ({
    ...club,
    upcoming_rides_count: rides.filter(
      (ride) =>
        ride.club_id === club.id &&
        ride.status === "active" &&
        new Date(ride.date_time).getTime() >= now
    ).length
  }));
}

export async function getClubBySlug(slug: string) {
  if (!isUsingSupabase()) {
    return getMockClubBySlug(slug);
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.from("clubs").select("*").eq("slug", slug).single();
  if (error) {
    return null;
  }

  return data as Club;
}

export async function getClubPageData(slug: string) {
  const [club, rides] = await Promise.all([getClubBySlug(slug), listRides()]);
  if (!club) {
    return null;
  }

  const now = Date.now();
  return {
    club,
    upcomingRides: rides.filter(
      (ride) => ride.club_id === club.id && new Date(ride.date_time).getTime() >= now
    ),
    pastRides: rides.filter(
      (ride) => ride.club_id === club.id && new Date(ride.date_time).getTime() < now
    )
  };
}

export async function getRideDetail(id: string): Promise<RideDetail | null> {
  const { rides, clubs, registrations, users } = await getBaseData();
  const ride = rides.find((candidate) => candidate.id === id);
  if (!ride) {
    return null;
  }

  const [enriched] = enrichRides([ride], clubs, registrations, users);
  if (!enriched) {
    return null;
  }

  const participants = registrations
    .filter((registration) => registration.ride_id === id && activeStatuses.has(registration.status))
    .map((registration) => ({
      ...registration,
      user: users.find((user) => user.id === registration.user_id) ?? demoUser
    }));

  return {
    ...enriched,
    participants
  };
}

export async function createRide(data: CreateRideData) {
  if (!isUsingSupabase()) {
    return createMockRide(data);
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data: inserted, error } = await client
    .from("rides")
    .insert({
      ...data,
      status: data.status ?? "active"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return inserted as Ride;
}

export async function ensureDemoUser() {
  if (!isUsingSupabase()) {
    return ensureMockDemoUser();
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    return demoUser;
  }

  const { data, error } = await client
    .from("users")
    .upsert(demoUser, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as User;
}

export async function upsertTelegramUser(telegramUser: TelegramMiniAppUser) {
  if (!isUsingSupabase()) {
    return upsertMockTelegramUser(telegramUser);
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const userPayload = {
    telegram_id: String(telegramUser.id),
    username: telegramUser.username ?? null,
    first_name: telegramUser.first_name || "Велосипедист",
    photo_url: telegramUser.photo_url ?? null,
    cycling_level: "casual",
    bike_type: "any",
    preferred_pace_min: 16,
    preferred_pace_max: 24
  };

  const { data, error } = await client
    .from("users")
    .upsert(userPayload, { onConflict: "telegram_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as User;
}

export async function upsertRideRegistration(
  rideId: string,
  userId: string,
  status: RegistrationStatus
) {
  if (!isUsingSupabase()) {
    return upsertMockRegistration(rideId, userId, status);
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await client
    .from("ride_registrations")
    .upsert(
      {
        ride_id: rideId,
        user_id: userId,
        status
      },
      { onConflict: "ride_id,user_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as RideRegistration;
}

export async function getProfileData(userId = demoUser.id) {
  const { rides, clubs, registrations, users } = await getBaseData();
  const user = users.find((candidate) => candidate.id === userId) ?? getMockUser(userId);
  const enriched = enrichRides(rides, clubs, registrations, users);
  const registeredIds = new Set(
    registrations
      .filter(
        (registration) =>
          registration.user_id === user.id && activeStatuses.has(registration.status)
      )
      .map((registration) => registration.ride_id)
  );

  return {
    user,
    registeredRides: enriched.filter((ride) => registeredIds.has(ride.id)),
    createdRides: enriched.filter((ride) => ride.creator_user_id === user.id)
  };
}

export async function updateUserPreferences(
  id: string,
  data: {
    cycling_level: CyclingLevel;
    bike_type: BikeType;
    preferred_pace_min: number;
    preferred_pace_max: number;
  }
) {
  if (!isUsingSupabase()) {
    return updateMockUserPreferences(id, data);
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data: updated, error } = await client
    .from("users")
    .update(data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as User;
}

export async function getUserById(id: string) {
  if (!isUsingSupabase()) {
    return getMockUser(id);
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.from("users").select("*").eq("id", id).single();
  if (error) {
    return null;
  }

  return data as User;
}

export async function getRideById(id: string) {
  if (!isUsingSupabase()) {
    return getMockRideById(id);
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.from("rides").select("*").eq("id", id).single();
  if (error) {
    return null;
  }

  return data as Ride;
}
