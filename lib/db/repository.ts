import { randomUUID } from "crypto";
import { demoUser } from "@/lib/demo-data";
import { bboxForLine } from "@/lib/geo";
import {
  demoCyclingInfrastructure,
  normalizeCyclingInfrastructureGeoJson,
  type CyclingInfrastructureFeature,
  type CyclingInfrastructureImportance,
  type CyclingInfrastructureSource,
  type CyclingInfrastructureType
} from "@/lib/map/cyclingInfrastructure";
import { simplifyLineString } from "@/lib/map/geojsonUtils";
import {
  cancelMockRide,
  createMockRide,
  createMockRoute,
  deleteMockClubMember,
  deleteMockRoute,
  ensureMockDemoUser,
  getMockClubById,
  getMockClubBySlug,
  getMockRideById,
  getMockRouteById,
  getMockUser,
  listMockAuditLogs,
  listMockClubApplications,
  listMockClubMemberships,
  listMockClubs,
  listMockMapPoints,
  listMockNotifications,
  listMockRegistrations,
  listMockReports,
  listMockRides,
  listMockRoutes,
  listMockUsers,
  markMockNotificationRead,
  moderateMockClubApplication,
  submitMockClubApplication,
  type CreateRideData,
  type CreateRouteData,
  updateMockClub,
  updateMockClubStatus,
  updateMockReport,
  updateMockRide,
  updateMockRoute,
  updateMockUserPreferences,
  updateMockUserRole,
  upsertMockClubMember,
  upsertMockRegistration,
  upsertMockTelegramUser
} from "@/lib/db/mock-store";
import { createSupabaseAdminClient, hasSupabaseEnv } from "@/lib/supabase/admin";
import type {
  AdminStats,
  AuditLog,
  BikeType,
  Club,
  ClubApplication,
  ClubMembership,
  ClubPageData,
  ClubRole,
  ClubStatus,
  CyclingLevel,
  GlobalRole,
  MapPoint,
  ModerationReport,
  Notification,
  ProfileData,
  RegistrationStatus,
  Ride,
  RideDetail,
  RideRegistration,
  RideOrganizer,
  RideWithClub,
  Route,
  TelegramMiniAppUser,
  User
} from "@/lib/types";

const activeRegistrationStatuses = new Set(["going", "maybe"]);
const manageClubRoles = new Set<ClubMembership["role"]>(["club_owner", "club_admin", "admin"]);
const organizerRoles = new Set<ClubMembership["role"]>([
  "club_owner",
  "club_admin",
  "club_organizer",
  "admin",
  "organizer"
]);
const publicRideStatuses = new Set<Ride["status"]>(["published", "active", "cancelled"]);

export function isUsingSupabase() {
  return hasSupabaseEnv();
}

function normalizeUser(user: User): User {
  return {
    ...user,
    username: user.username ?? user.telegram_username ?? null,
    telegram_username: user.telegram_username ?? user.username ?? null,
    global_role: user.global_role ?? "rider",
    cycling_level: user.cycling_level ?? user.level ?? "casual",
    bike_type: user.bike_type ?? "any",
    preferred_pace_min: Number(user.preferred_pace_min ?? user.comfortable_pace_min ?? 16),
    preferred_pace_max: Number(user.preferred_pace_max ?? user.comfortable_pace_max ?? 24)
  };
}

function normalizeClub(club: Club): Club {
  return {
    ...club,
    logo_url: club.logo_url ?? club.avatar_url ?? null,
    avatar_url: club.avatar_url ?? club.logo_url ?? null,
    status: club.status ?? "active",
    tags: club.tags ?? []
  };
}

function normalizeRide(ride: Ride): Ride {
  return {
    ...ride,
    creator_user_id: ride.creator_user_id ?? ride.organizer_user_id ?? demoUser.id,
    organizer_user_id: ride.organizer_user_id ?? ride.creator_user_id,
    organizer_type: ride.organizer_type ?? (ride.club_id ? "club" : "personal"),
    date_time: ride.date_time ?? ride.start_time ?? new Date().toISOString(),
    start_time: ride.start_time ?? ride.date_time,
    start_location_name: ride.start_location_name ?? ride.start_place_name ?? "Точка старта",
    start_place_name: ride.start_place_name ?? ride.start_location_name,
    finish_location_name: ride.finish_location_name ?? ride.finish_place_name ?? null,
    finish_place_name: ride.finish_place_name ?? ride.finish_location_name ?? null,
    pace_min_kmh: Number(ride.pace_min_kmh ?? ride.pace_min ?? 16),
    pace_max_kmh: Number(ride.pace_max_kmh ?? ride.pace_max ?? 24),
    distance_km: Number(ride.distance_km ?? 0),
    bike_type: ride.bike_type ?? ride.bike_types?.[0] ?? "any",
    route_id: ride.route_id ?? null,
    status: ride.status ?? "published",
    visibility: ride.visibility ?? "public",
    cancellation_reason: ride.cancellation_reason ?? null
  };
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
      clubs: listMockClubs().map(normalizeClub),
      clubMemberships: listMockClubMemberships(),
      users: listMockUsers().map(normalizeUser),
      rides: listMockRides(true).map(normalizeRide),
      registrations: listMockRegistrations(),
      mapPoints: listMockMapPoints(),
      routes: listMockRoutes(),
      clubApplications: listMockClubApplications(),
      reports: listMockReports(),
      notifications: listMockNotifications(),
      auditLogs: listMockAuditLogs()
    };
  }

  const [
    clubs,
    clubMemberships,
    users,
    rides,
    registrations,
    mapPoints,
    routes,
    clubApplications,
    reports,
    notifications,
    auditLogs
  ] = await Promise.all([
    getSupabaseRows<Club>("clubs", { column: "name" }),
    getSupabaseRows<ClubMembership>("club_memberships", { column: "created_at" }),
    getSupabaseRows<User>("users", { column: "created_at" }),
    getSupabaseRows<Ride>("rides", { column: "date_time" }),
    getSupabaseRows<RideRegistration>("ride_registrations", { column: "created_at" }),
    getSupabaseRows<MapPoint>("map_points", { column: "created_at" }),
    getSupabaseRows<Route>("routes", { column: "created_at", ascending: false }),
    getSupabaseRows<ClubApplication>("club_applications", {
      column: "created_at",
      ascending: false
    }),
    getSupabaseRows<ModerationReport>("moderation_reports", {
      column: "created_at",
      ascending: false
    }),
    getSupabaseRows<Notification>("notifications", { column: "created_at", ascending: false }),
    getSupabaseRows<AuditLog>("audit_logs", { column: "created_at", ascending: false })
  ]);

  return {
    clubs: (clubs ?? []).map(normalizeClub),
    clubMemberships: clubMemberships ?? [],
    users: (users ?? []).map(normalizeUser),
    rides: (rides ?? []).map(normalizeRide),
    registrations: registrations ?? [],
    mapPoints: mapPoints ?? [],
    routes: routes ?? [],
    clubApplications: clubApplications ?? [],
    reports: reports ?? [],
    notifications: notifications ?? [],
    auditLogs: auditLogs ?? []
  };
}

function enrichRides(
  rides: Ride[],
  clubs: Club[],
  registrations: RideRegistration[],
  users: User[],
  routes: Route[],
  includeHidden = false
): RideWithClub[] {
  return rides
    .map(normalizeRide)
    .filter((ride) => includeHidden || publicRideStatuses.has(ride.status))
    .filter((ride) => includeHidden || ride.visibility === "public")
    .map((ride) => {
      const club = ride.club_id
        ? clubs.find((candidate) => candidate.id === ride.club_id) ?? null
        : null;
      if (ride.club_id && !club && !includeHidden) {
        return null;
      }
      if (club && !includeHidden && (club.status ?? "active") !== "active") {
        return null;
      }
      const creator = users.find((candidate) => candidate.id === ride.creator_user_id);
      const route = ride.route_id
        ? routes.find((candidate) => candidate.id === ride.route_id) ?? null
        : null;
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
        route,
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

export async function listRides(options: { includeHidden?: boolean } = {}) {
  const { rides, clubs, registrations, users, routes } = await getBaseData();
  return enrichRides(rides, clubs, registrations, users, routes, options.includeHidden);
}

export async function listMapPoints() {
  const { mapPoints } = await getBaseData();
  return mapPoints;
}

type CyclingInfrastructureRow = {
  id: string;
  type: CyclingInfrastructureType;
  title: string | null;
  description: string | null;
  geometry_geojson: CyclingInfrastructureFeature["geometry"];
  importance: CyclingInfrastructureImportance;
  source: CyclingInfrastructureSource;
  min_zoom: number | null;
};

export async function listCyclingInfrastructure(): Promise<CyclingInfrastructureFeature[]> {
  if (!isUsingSupabase()) {
    return demoCyclingInfrastructure;
  }

  try {
    const rows = await getSupabaseRows<CyclingInfrastructureRow>("cycling_infrastructure", {
      column: "created_at"
    });
    if (!rows?.length) {
      return demoCyclingInfrastructure;
    }

    return normalizeCyclingInfrastructureGeoJson({
      type: "FeatureCollection",
      features: rows.map((row) => ({
        type: "Feature",
        properties: {
          id: row.id,
          type: row.type,
          title: row.title ?? undefined,
          description: row.description ?? undefined,
          importance: row.importance,
          source: row.source,
          min_zoom: row.min_zoom ?? undefined
        },
        geometry: row.geometry_geojson
      }))
    });
  } catch {
    return demoCyclingInfrastructure;
  }
}

export async function listClubMemberships() {
  const { clubMemberships } = await getBaseData();
  return clubMemberships;
}

export async function listOrganizerClubs(userId: string) {
  const { clubs, clubMemberships, users } = await getBaseData();
  const user = users.find((candidate) => candidate.id === userId);
  if (user?.global_role === "super_admin") {
    return clubs;
  }
  const allowedClubIds = new Set(
    clubMemberships
      .filter((membership) => membership.user_id === userId && organizerRoles.has(membership.role))
      .map((membership) => membership.club_id)
  );

  return clubs.filter((club) => allowedClubIds.has(club.id));
}

export async function canManageClub(userId: string, clubId: string) {
  const { users, clubMemberships } = await getBaseData();
  const user = users.find((candidate) => candidate.id === userId);
  if (user?.global_role === "super_admin") {
    return true;
  }
  return clubMemberships.some(
    (membership) =>
      membership.club_id === clubId &&
      membership.user_id === userId &&
      manageClubRoles.has(membership.role)
  );
}

export async function canCreateRide(userId: string, clubId?: string | null) {
  const { users, clubMemberships } = await getBaseData();
  const user = users.find((candidate) => candidate.id === userId);
  if (user?.global_role === "super_admin") {
    return true;
  }
  if (!clubId) {
    return Boolean(user);
  }
  return clubMemberships.some(
    (membership) =>
      membership.club_id === clubId &&
      membership.user_id === userId &&
      organizerRoles.has(membership.role)
  );
}

export async function canCreateRideForClub(userId: string, clubId: string) {
  return canCreateRide(userId, clubId);
}

export async function canEditRide(userId: string, rideId: string) {
  const { users, rides, clubMemberships } = await getBaseData();
  const user = users.find((candidate) => candidate.id === userId);
  if (user?.global_role === "super_admin") {
    return true;
  }
  const ride = rides.find((candidate) => candidate.id === rideId);
  if (!ride) {
    return false;
  }
  if (ride.creator_user_id === userId) {
    return true;
  }
  if (!ride.club_id) {
    return false;
  }
  return clubMemberships.some(
    (membership) =>
      membership.club_id === ride.club_id &&
      membership.user_id === userId &&
      (membership.role === "club_owner" ||
        membership.role === "club_admin" ||
        membership.role === "admin" ||
        membership.role === "club_organizer" ||
        membership.role === "organizer")
  );
}

export async function canModerateApplication(userId: string) {
  const user = await getUserById(userId);
  return user?.global_role === "super_admin";
}

export async function listClubs(options: { includeHidden?: boolean } = {}) {
  const { clubs, rides } = await getBaseData();
  const now = Date.now();

  return clubs
    .filter((club) => options.includeHidden || (club.status ?? "active") === "active")
    .map((club) => ({
      ...club,
      upcoming_rides_count: rides.filter(
        (ride) =>
          ride.club_id === club.id &&
          publicRideStatuses.has(ride.status) &&
          ride.status !== "cancelled" &&
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

  return normalizeClub(data as Club);
}

export async function getClubById(id: string) {
  if (!isUsingSupabase()) {
    return getMockClubById(id);
  }
  const client = createSupabaseAdminClient();
  if (!client) return null;
  const { data, error } = await client.from("clubs").select("*").eq("id", id).single();
  if (error) return null;
  return normalizeClub(data as Club);
}

export async function getClubPageData(slug: string, userId = demoUser.id): Promise<ClubPageData | null> {
  const { clubs, rides, registrations, users, routes, clubMemberships } = await getBaseData();
  const club = clubs.find((candidate) => candidate.slug === slug);
  if (!club) {
    return null;
  }

  const now = Date.now();
  const enriched = enrichRides(
    rides.filter((ride) => ride.club_id === club.id),
    clubs,
    registrations,
    users,
    routes,
    true
  );
  const members = clubMemberships
    .filter((membership) => membership.club_id === club.id)
    .map((membership) => ({
      ...membership,
      user: users.find((user) => user.id === membership.user_id) ?? demoUser
    }));

  return {
    club,
    upcomingRides: enriched.filter(
      (ride) => publicRideStatuses.has(ride.status) && new Date(ride.date_time).getTime() >= now
    ),
    pastRides: enriched.filter((ride) => new Date(ride.date_time).getTime() < now),
    members,
    canManage: await canManageClub(userId, club.id)
  };
}

export async function getRideDetail(id: string, includeHidden = false): Promise<RideDetail | null> {
  const { rides, clubs, registrations, users, routes } = await getBaseData();
  const ride = rides.find((candidate) => candidate.id === id);
  if (!ride) {
    return null;
  }

  const [enriched] = enrichRides([ride], clubs, registrations, users, routes, includeHidden);
  if (!enriched) {
    return null;
  }

  const participants = registrations
    .filter((registration) => registration.ride_id === id && activeRegistrationStatuses.has(registration.status))
    .map((registration) => ({
      ...registration,
      user: users.find((user) => user.id === registration.user_id) ?? demoUser
    }));

  return {
    ...enriched,
    participants
  };
}

export async function createRoute(data: CreateRouteData) {
  if (!isUsingSupabase()) {
    return createMockRoute({
      ...data,
      simplified_geometry_geojson:
        data.simplified_geometry_geojson ?? (data.geometry_geojson ? simplifyLineString(data.geometry_geojson) : null)
    });
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const payload = {
    ...data,
    simplified_geometry_geojson:
      data.simplified_geometry_geojson ?? (data.geometry_geojson ? simplifyLineString(data.geometry_geojson) : null),
    bbox: data.bbox ?? bboxForLine(data.geometry_geojson)
  };
  const { data: inserted, error } = await client.from("routes").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return inserted as Route;
}

export async function updateRoute(id: string, data: Partial<Route>) {
  if (!isUsingSupabase()) {
    return updateMockRoute(id, data);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data: updated, error } = await client
    .from("routes")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return updated as Route;
}

export async function deleteRoute(id: string) {
  if (!isUsingSupabase()) {
    return deleteMockRoute(id);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { error } = await client.from("routes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function getRouteById(id: string) {
  if (!isUsingSupabase()) {
    return getMockRouteById(id);
  }
  const client = createSupabaseAdminClient();
  if (!client) return null;
  const { data, error } = await client.from("routes").select("*").eq("id", id).single();
  if (error) return null;
  return data as Route;
}

export async function createRide(data: CreateRideData) {
  const payload = {
    ...data,
    organizer_type: data.club_id ? ("club" as const) : ("personal" as const),
    visibility: data.visibility ?? "public",
    route_id: data.route_id ?? null,
    cancellation_reason: null,
    status: data.status ?? "published"
  };

  if (!isUsingSupabase()) {
    return createMockRide(payload);
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data: inserted, error } = await client.from("rides").insert(payload).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog(payload.creator_user_id, "ride_create", "ride", inserted.id, null, inserted);
  return normalizeRide(inserted as Ride);
}

export async function updateRide(id: string, data: Partial<Ride>, actorUserId: string) {
  if (!isUsingSupabase()) {
    return updateMockRide(id, data, actorUserId);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const before = await getRideById(id);
  const { data: updated, error } = await client
    .from("rides")
    .update({ ...data, updated_at: new Date().toISOString(), last_changed_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await notifyRideParticipants(id, "ride_changed", "Заезд изменен", `Обновлены детали заезда «${updated.title}».`);
  await createAuditLog(actorUserId, "ride_edit", "ride", id, before, updated);
  return normalizeRide(updated as Ride);
}

export async function cancelRide(id: string, reason: string, actorUserId: string) {
  if (!isUsingSupabase()) {
    return cancelMockRide(id, reason, actorUserId);
  }
  return updateRide(id, { status: "cancelled", cancellation_reason: reason }, actorUserId);
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
    .upsert({ ...demoUser, username: demoUser.username, global_role: "super_admin" }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeUser(data as User);
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
    telegram_username: telegramUser.username ?? null,
    first_name: telegramUser.first_name || "Велосипедист",
    last_name: telegramUser.last_name ?? null,
    photo_url: telegramUser.photo_url ?? null,
    global_role: "rider",
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

  return normalizeUser(data as User);
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
        status,
        updated_at: new Date().toISOString()
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

export async function getProfileData(userId = demoUser.id): Promise<ProfileData> {
  const { rides, clubs, registrations, users, routes, clubMemberships, clubApplications, notifications } =
    await getBaseData();
  const user = users.find((candidate) => candidate.id === userId) ?? getMockUser(userId);
  const enriched = enrichRides(rides, clubs, registrations, users, routes, true);
  const registeredIds = new Set(
    registrations
      .filter(
        (registration) =>
          registration.user_id === user.id && activeRegistrationStatuses.has(registration.status)
      )
      .map((registration) => registration.ride_id)
  );
  const userMemberships = clubMemberships.filter((membership) => membership.user_id === user.id);
  const clubIds = new Set(userMemberships.map((membership) => membership.club_id));

  return {
    user,
    registeredRides: enriched.filter((ride) => registeredIds.has(ride.id)),
    createdRides: enriched.filter((ride) => ride.creator_user_id === user.id),
    clubs: clubs.filter((club) => clubIds.has(club.id)),
    applications: clubApplications.filter((application) => application.applicant_user_id === user.id),
    notifications: notifications.filter((notification) => notification.user_id === user.id),
    memberships: userMemberships
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
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeUser(updated as User);
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

  return normalizeUser(data as User);
}

export async function getRideById(id: string) {
  if (!isUsingSupabase()) {
    const ride = getMockRideById(id);
    return ride ? normalizeRide(ride) : null;
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.from("rides").select("*").eq("id", id).single();
  if (error) {
    return null;
  }

  return normalizeRide(data as Ride);
}

export async function submitClubApplication(
  data: Omit<
    ClubApplication,
    "id" | "created_at" | "status" | "admin_comment" | "reviewed_by_user_id" | "reviewed_at"
  >
) {
  if (!isUsingSupabase()) {
    return submitMockClubApplication(data);
  }
  const { clubApplications, clubs } = await getBaseData();
  if (
    clubApplications.some(
      (application) =>
        application.applicant_user_id === data.applicant_user_id && application.status === "pending"
    )
  ) {
    throw new Error("У вас уже есть заявка на модерации");
  }
  if (clubs.some((club) => club.slug === data.proposed_slug)) {
    throw new Error("Такой slug клуба уже занят");
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data: inserted, error } = await client
    .from("club_applications")
    .insert(data)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await createNotification(demoUser.id, {
    type: "club_application",
    title: "Новая заявка на клуб",
    body: `${data.proposed_name} ждет решения.`,
    entity_type: "club_application",
    entity_id: inserted.id
  });
  return inserted as ClubApplication;
}

export async function moderateClubApplication(
  id: string,
  action: "approve" | "reject",
  adminUserId: string,
  adminComment: string | null
) {
  if (!isUsingSupabase()) {
    return moderateMockClubApplication(id, action, adminUserId, adminComment);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data: existing, error: fetchError } = await client
    .from("club_applications")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);
  const application = existing as ClubApplication;

  const { data: updated, error } = await client
    .from("club_applications")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      admin_comment: adminComment,
      reviewed_by_user_id: adminUserId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (action === "approve") {
    const { data: club, error: clubError } = await client
      .from("clubs")
      .insert({
        name: application.proposed_name,
        slug: application.proposed_slug,
        description: application.description,
        telegram_url: application.telegram_url,
        city: application.city,
        tags: application.tags,
        status: "active",
        created_by_user_id: application.applicant_user_id,
        approved_by_user_id: adminUserId,
        approved_at: new Date().toISOString()
      })
      .select("*")
      .single();
    if (clubError) throw new Error(clubError.message);
    await client.from("club_memberships").insert({
      club_id: club.id,
      user_id: application.applicant_user_id,
      role: "club_owner"
    });
    await createNotification(application.applicant_user_id, {
      type: "club_application_approved",
      title: "Клуб одобрен",
      body: `${application.proposed_name} опубликован, вы назначены владельцем клуба.`,
      entity_type: "club",
      entity_id: club.id
    });
  } else {
    await createNotification(application.applicant_user_id, {
      type: "club_application_rejected",
      title: "Заявка отклонена",
      body: adminComment || "Администратор отклонил заявку. Можно подать новую.",
      entity_type: "club_application",
      entity_id: id
    });
  }
  await createAuditLog(adminUserId, `club_application_${action}`, "club_application", id, application, updated);
  return updated as ClubApplication;
}

export async function listClubApplications(options: { userId?: string } = {}) {
  const { clubApplications } = await getBaseData();
  return options.userId
    ? clubApplications.filter((application) => application.applicant_user_id === options.userId)
    : clubApplications;
}

export async function updateClub(id: string, data: Partial<Club>, actorUserId: string) {
  if (!isUsingSupabase()) {
    return updateMockClub(id, data, actorUserId);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const before = await getClubById(id);
  const { data: updated, error } = await client
    .from("clubs")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await createAuditLog(actorUserId, "club_edit", "club", id, before, updated);
  return normalizeClub(updated as Club);
}

export async function updateClubStatus(id: string, status: ClubStatus, actorUserId: string) {
  if (!isUsingSupabase()) {
    return updateMockClubStatus(id, status, actorUserId);
  }
  return updateClub(id, { status }, actorUserId);
}

export async function upsertClubMember(
  clubId: string,
  userId: string,
  role: ClubRole,
  actorUserId: string
) {
  if (!isUsingSupabase()) {
    return upsertMockClubMember(clubId, userId, role, actorUserId);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data, error } = await client
    .from("club_memberships")
    .upsert({ club_id: clubId, user_id: userId, role }, { onConflict: "club_id,user_id" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await createAuditLog(actorUserId, "club_member_upsert", "club_member", data.id, null, data);
  if (role === "club_organizer" || role === "organizer") {
    await createNotification(userId, {
      type: "club_organizer_assigned",
      title: "Вы назначены организатором",
      body: "Теперь вы можете создавать заезды от имени клуба.",
      entity_type: "club",
      entity_id: clubId
    });
  }
  return data as ClubMembership;
}

export async function removeClubMember(clubId: string, memberId: string, actorUserId: string) {
  if (!isUsingSupabase()) {
    return deleteMockClubMember(clubId, memberId, actorUserId);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { error } = await client.from("club_memberships").delete().eq("club_id", clubId).eq("id", memberId);
  if (error) throw new Error(error.message);
  await createAuditLog(actorUserId, "club_member_remove", "club_member", memberId, null, null);
  return true;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { users, clubs, rides, registrations, clubApplications, reports } = await getBaseData();
  const clubStatuses: AdminStats["clubs"] = {
    pending: 0,
    active: 0,
    rejected: 0,
    suspended: 0,
    archived: 0
  };
  clubs.forEach((club) => {
    clubStatuses[club.status ?? "active"] += 1;
  });

  const rideStatuses = rides.reduce<Record<string, number>>((acc, ride) => {
    acc[ride.status] = (acc[ride.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    users: users.length,
    clubs: clubStatuses,
    rides: rideStatuses,
    registrations: registrations.length,
    latestApplications: clubApplications.slice(0, 5),
    latestReports: reports.slice(0, 5)
  };
}

export async function listUsers() {
  const { users } = await getBaseData();
  return users;
}

export async function updateUserRole(id: string, role: GlobalRole, actorUserId: string) {
  if (!isUsingSupabase()) {
    return updateMockUserRole(id, role, actorUserId);
  }
  const { users } = await getBaseData();
  const target = users.find((user) => user.id === id);
  const superAdminCount = users.filter((user) => user.global_role === "super_admin").length;
  if (target?.global_role === "super_admin" && role !== "super_admin" && superAdminCount <= 1) {
    throw new Error("Нельзя снять роль у последнего super_admin");
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data, error } = await client
    .from("users")
    .update({ global_role: role, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await createAuditLog(actorUserId, "user_role_change", "user", id, target, data);
  return normalizeUser(data as User);
}

export async function listAdminClubs() {
  return listClubs({ includeHidden: true });
}

export async function listAdminRides() {
  return listRides({ includeHidden: true });
}

export async function listReports() {
  const { reports } = await getBaseData();
  return reports;
}

export async function updateReport(id: string, data: Partial<ModerationReport>, actorUserId: string) {
  if (!isUsingSupabase()) {
    return updateMockReport(id, data, actorUserId);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data: updated, error } = await client
    .from("moderation_reports")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await createAuditLog(actorUserId, "report_update", "moderation_report", id, null, updated);
  return updated as ModerationReport;
}

export async function listAuditLogs() {
  const { auditLogs } = await getBaseData();
  return auditLogs;
}

export async function listNotifications(userId: string) {
  const { notifications } = await getBaseData();
  return notifications.filter((notification) => notification.user_id === userId);
}

export async function markNotificationRead(id: string, userId: string) {
  if (!isUsingSupabase()) {
    return markMockNotificationRead(id, userId);
  }
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data, error } = await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Notification;
}

async function createNotification(
  userId: string,
  data: Omit<Notification, "id" | "user_id" | "read_at" | "created_at">
) {
  if (!isUsingSupabase()) {
    return null;
  }
  const client = createSupabaseAdminClient();
  if (!client) return null;
  const { error } = await client.from("notifications").insert({
    ...data,
    user_id: userId
  });
  if (error) throw new Error(error.message);
  return true;
}

async function notifyRideParticipants(rideId: string, type: string, title: string, body: string) {
  if (!isUsingSupabase()) {
    return;
  }
  const { registrations } = await getBaseData();
  const userIds = new Set(
    registrations
      .filter(
        (registration) =>
          registration.ride_id === rideId &&
          (registration.status === "going" || registration.status === "maybe")
      )
      .map((registration) => registration.user_id)
  );
  await Promise.all(
    [...userIds].map((userId) =>
      createNotification(userId, {
        type,
        title,
        body,
        entity_type: "ride",
        entity_id: rideId
      })
    )
  );
}

async function createAuditLog(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValue: unknown,
  newValue: unknown
) {
  if (!isUsingSupabase()) {
    return;
  }
  const client = createSupabaseAdminClient();
  if (!client) return;
  const { error } = await client.from("audit_logs").insert({
    id: randomUUID(),
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldValue && typeof oldValue === "object" ? oldValue : null,
    new_value: newValue && typeof newValue === "object" ? newValue : null
  });
  if (error) throw new Error(error.message);
}
