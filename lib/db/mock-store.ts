import { randomUUID } from "crypto";
import { buildDemoData, demoUser } from "@/lib/demo-data";
import { bboxForLine } from "@/lib/geo";
import type {
  BikeType,
  Club,
  ClubApplication,
  ClubMembership,
  ClubRole,
  ClubStatus,
  CyclingLevel,
  GlobalRole,
  MapPoint,
  ModerationReport,
  Notification,
  RegistrationStatus,
  Ride,
  RideRegistration,
  Route,
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

function nowIso() {
  return new Date().toISOString();
}

export function listMockClubs(includeHidden = true) {
  const clubs = [...getStore().clubs];
  return includeHidden ? clubs : clubs.filter((club) => (club.status ?? "active") === "active");
}

export function listMockClubMemberships() {
  return [...getStore().clubMemberships];
}

export function listMockUsers() {
  return [...getStore().users];
}

export function listMockRides(includeHidden = true) {
  return [...getStore().rides]
    .filter((ride) => includeHidden || !["draft", "archived"].includes(ride.status))
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
}

export function listMockRoutes() {
  return [...getStore().routes];
}

export function listMockMapPoints() {
  return [...getStore().mapPoints];
}

export function listMockRegistrations() {
  return [...getStore().registrations];
}

export function listMockClubApplications() {
  return [...getStore().clubApplications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function listMockReports() {
  return [...getStore().reports].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function listMockNotifications(userId?: string) {
  return [...getStore().notifications]
    .filter((notification) => !userId || notification.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function listMockAuditLogs() {
  return [...getStore().auditLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
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
    existing.telegram_username = telegramUser.username ?? existing.telegram_username;
    existing.first_name = telegramUser.first_name || existing.first_name;
    existing.last_name = telegramUser.last_name ?? existing.last_name;
    existing.photo_url = telegramUser.photo_url ?? existing.photo_url;
    existing.updated_at = nowIso();
    return existing;
  }

  const user: User = {
    id: randomUUID(),
    telegram_id: telegramId,
    username: telegramUser.username ?? null,
    telegram_username: telegramUser.username ?? null,
    first_name: telegramUser.first_name || "Велосипедист",
    last_name: telegramUser.last_name ?? null,
    photo_url: telegramUser.photo_url ?? null,
    global_role: "rider",
    cycling_level: "casual",
    bike_type: "any",
    preferred_pace_min: 16,
    preferred_pace_max: 24,
    created_at: nowIso()
  };

  store.users.push(user);
  return user;
}

export type CreateRouteData = Omit<Route, "id" | "created_at" | "bbox" | "updated_at"> & {
  bbox?: Route["bbox"];
};

export function createMockRoute(data: CreateRouteData) {
  const store = getStore();
  const route: Route = {
    ...data,
    id: randomUUID(),
    bbox: data.bbox ?? bboxForLine(data.geometry_geojson),
    created_at: nowIso()
  };
  store.routes.unshift(route);
  return route;
}

export function updateMockRoute(id: string, data: Partial<Route>) {
  const route = getStore().routes.find((candidate) => candidate.id === id);
  if (!route) {
    return null;
  }
  Object.assign(route, data, { updated_at: nowIso() });
  return route;
}

export function deleteMockRoute(id: string) {
  const store = getStore();
  const index = store.routes.findIndex((route) => route.id === id);
  if (index === -1) {
    return false;
  }
  store.routes.splice(index, 1);
  store.rides.forEach((ride) => {
    if (ride.route_id === id) {
      ride.route_id = null;
    }
  });
  return true;
}

export type CreateRideData = Omit<Ride, "id" | "created_at" | "status"> & {
  status?: Ride["status"];
};

export function createMockRide(data: CreateRideData) {
  const store = getStore();
  const ride: Ride = {
    ...data,
    id: randomUUID(),
    organizer_type: data.club_id ? "club" : "personal",
    visibility: data.visibility ?? "public",
    route_id: data.route_id ?? null,
    cancellation_reason: null,
    status: data.status ?? "published",
    created_at: nowIso()
  };
  store.rides.unshift(ride);
  pushMockAuditLog(data.creator_user_id, "ride_create", "ride", ride.id, null, ride);
  return ride;
}

export function updateMockRide(id: string, data: Partial<Ride>, actorUserId: string) {
  const ride = getMockRideById(id);
  if (!ride) {
    return null;
  }
  const before = { ...ride };
  Object.assign(ride, data, { updated_at: nowIso(), last_changed_at: nowIso() });
  notifyRideParticipants(id, "ride_changed", "Заезд изменен", `Обновлены детали заезда «${ride.title}».`);
  pushMockAuditLog(actorUserId, "ride_edit", "ride", id, before, ride);
  return ride;
}

export function cancelMockRide(id: string, reason: string, actorUserId: string) {
  const ride = getMockRideById(id);
  if (!ride) {
    return null;
  }
  const before = { ...ride };
  ride.status = "cancelled";
  ride.cancellation_reason = reason;
  ride.updated_at = nowIso();
  ride.last_changed_at = nowIso();
  notifyRideParticipants(id, "ride_cancelled", "Заезд отменен", `«${ride.title}» отменен. Причина: ${reason}`);
  pushMockAuditLog(actorUserId, "ride_cancel", "ride", id, before, ride);
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
    existing.updated_at = nowIso();
    return existing;
  }

  const registration: RideRegistration = {
    id: randomUUID(),
    ride_id: rideId,
    user_id: userId,
    status,
    created_at: nowIso()
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

  Object.assign(user, data, { updated_at: nowIso() });
  return user;
}

export function updateMockUserRole(id: string, role: GlobalRole, actorUserId: string) {
  const store = getStore();
  const user = store.users.find((candidate) => candidate.id === id);
  if (!user) {
    return null;
  }
  const superAdmins = store.users.filter((candidate) => candidate.global_role === "super_admin");
  if (user.global_role === "super_admin" && role !== "super_admin" && superAdmins.length <= 1) {
    throw new Error("Нельзя снять роль у последнего super_admin");
  }
  const before = { ...user };
  user.global_role = role;
  user.updated_at = nowIso();
  pushMockAuditLog(actorUserId, "user_role_change", "user", id, before, user);
  return user;
}

export function getMockClubBySlug(slug: string): Club | null {
  return getStore().clubs.find((club) => club.slug === slug) ?? null;
}

export function getMockClubById(id: string): Club | null {
  return getStore().clubs.find((club) => club.id === id) ?? null;
}

export function updateMockClub(id: string, data: Partial<Club>, actorUserId: string) {
  const club = getMockClubById(id);
  if (!club) {
    return null;
  }
  const before = { ...club };
  Object.assign(club, data, { updated_at: nowIso() });
  pushMockAuditLog(actorUserId, "club_edit", "club", id, before, club);
  return club;
}

export function updateMockClubStatus(id: string, status: ClubStatus, actorUserId: string) {
  return updateMockClub(id, { status }, actorUserId);
}

export function getMockRideById(id: string): Ride | null {
  return getStore().rides.find((ride) => ride.id === id) ?? null;
}

export function getMockRouteById(id: string): Route | null {
  return getStore().routes.find((route) => route.id === id) ?? null;
}

export function getMockMapPointById(id: string): MapPoint | null {
  return getStore().mapPoints.find((point) => point.id === id) ?? null;
}

export function submitMockClubApplication(
  data: Omit<ClubApplication, "id" | "created_at" | "status" | "admin_comment" | "reviewed_by_user_id" | "reviewed_at">
) {
  const store = getStore();
  const existingPending = store.clubApplications.find(
    (application) =>
      application.applicant_user_id === data.applicant_user_id && application.status === "pending"
  );
  if (existingPending) {
    throw new Error("У вас уже есть заявка на модерации");
  }
  if (store.clubs.some((club) => club.slug === data.proposed_slug)) {
    throw new Error("Такой slug клуба уже занят");
  }

  const application: ClubApplication = {
    ...data,
    id: randomUUID(),
    status: "pending",
    admin_comment: null,
    reviewed_by_user_id: null,
    reviewed_at: null,
    created_at: nowIso()
  };
  store.clubApplications.unshift(application);
  pushMockNotification(demoUser.id, {
    type: "club_application",
    title: "Новая заявка на клуб",
    body: `${application.proposed_name} ждет решения.`,
    entity_type: "club_application",
    entity_id: application.id
  });
  return application;
}

export function moderateMockClubApplication(
  id: string,
  action: "approve" | "reject",
  adminUserId: string,
  adminComment: string | null
) {
  const store = getStore();
  const application = store.clubApplications.find((candidate) => candidate.id === id);
  if (!application) {
    return null;
  }
  if (application.status !== "pending") {
    return application;
  }

  const before = { ...application };
  application.status = action === "approve" ? "approved" : "rejected";
  application.admin_comment = adminComment;
  application.reviewed_by_user_id = adminUserId;
  application.reviewed_at = nowIso();
  application.updated_at = nowIso();

  if (action === "approve") {
    const club: Club = {
      id: randomUUID(),
      name: application.proposed_name,
      slug: application.proposed_slug,
      description: application.description,
      logo_url: null,
      avatar_url: null,
      cover_url: null,
      telegram_url: application.telegram_url,
      city: application.city,
      sport_type: "cycling",
      tags: application.tags,
      status: "active",
      created_by_user_id: application.applicant_user_id,
      approved_by_user_id: adminUserId,
      approved_at: nowIso(),
      rejection_reason: null,
      created_at: nowIso()
    };
    store.clubs.unshift(club);
    store.clubMemberships.unshift({
      id: randomUUID(),
      club_id: club.id,
      user_id: application.applicant_user_id,
      role: "club_owner",
      created_at: nowIso()
    });
    pushMockNotification(application.applicant_user_id, {
      type: "club_application_approved",
      title: "Клуб одобрен",
      body: `${club.name} опубликован, а вы назначены владельцем клуба.`,
      entity_type: "club",
      entity_id: club.id
    });
  } else {
    pushMockNotification(application.applicant_user_id, {
      type: "club_application_rejected",
      title: "Заявка отклонена",
      body: adminComment || "Администратор отклонил заявку. Можно подать новую.",
      entity_type: "club_application",
      entity_id: application.id
    });
  }

  pushMockAuditLog(adminUserId, `club_application_${action}`, "club_application", id, before, application);
  return application;
}

export function upsertMockClubMember(
  clubId: string,
  userId: string,
  role: ClubRole,
  actorUserId: string
) {
  const store = getStore();
  const existing = store.clubMemberships.find(
    (membership) => membership.club_id === clubId && membership.user_id === userId
  );
  if (existing) {
    const before = { ...existing };
    existing.role = role;
    existing.updated_at = nowIso();
    pushMockAuditLog(actorUserId, "club_member_role_change", "club_member", existing.id, before, existing);
    return existing;
  }

  const membership: ClubMembership = {
    id: randomUUID(),
    club_id: clubId,
    user_id: userId,
    role,
    created_at: nowIso()
  };
  store.clubMemberships.push(membership);
  pushMockAuditLog(actorUserId, "club_member_add", "club_member", membership.id, null, membership);
  if (role === "club_organizer" || role === "organizer") {
    pushMockNotification(userId, {
      type: "club_organizer_assigned",
      title: "Вы назначены организатором",
      body: "Теперь вы можете создавать заезды от имени клуба.",
      entity_type: "club",
      entity_id: clubId
    });
  }
  return membership;
}

export function deleteMockClubMember(clubId: string, memberId: string, actorUserId: string) {
  const store = getStore();
  const index = store.clubMemberships.findIndex(
    (membership) => membership.club_id === clubId && membership.id === memberId
  );
  if (index === -1) {
    return false;
  }
  const [removed] = store.clubMemberships.splice(index, 1);
  pushMockAuditLog(actorUserId, "club_member_remove", "club_member", memberId, removed, null);
  return true;
}

export function markMockNotificationRead(id: string, userId: string) {
  const notification = getStore().notifications.find(
    (candidate) => candidate.id === id && candidate.user_id === userId
  );
  if (!notification) {
    return null;
  }
  notification.read_at = nowIso();
  return notification;
}

export function updateMockReport(id: string, data: Partial<ModerationReport>, actorUserId: string) {
  const report = getStore().reports.find((candidate) => candidate.id === id);
  if (!report) {
    return null;
  }
  const before = { ...report };
  Object.assign(report, data, { updated_at: nowIso() });
  pushMockAuditLog(actorUserId, "report_update", "moderation_report", id, before, report);
  return report;
}

function pushMockNotification(
  userId: string,
  data: Omit<Notification, "id" | "user_id" | "read_at" | "created_at">
) {
  getStore().notifications.unshift({
    ...data,
    id: randomUUID(),
    user_id: userId,
    read_at: null,
    created_at: nowIso()
  });
}

function notifyRideParticipants(rideId: string, type: string, title: string, body: string) {
  const userIds = new Set(
    getStore().registrations
      .filter(
        (registration) =>
          registration.ride_id === rideId &&
          (registration.status === "going" || registration.status === "maybe")
      )
      .map((registration) => registration.user_id)
  );

  userIds.forEach((userId) =>
    pushMockNotification(userId, {
      type,
      title,
      body,
      entity_type: "ride",
      entity_id: rideId
    })
  );
}

function pushMockAuditLog(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValue: unknown,
  newValue: unknown
) {
  getStore().auditLogs.unshift({
    id: randomUUID(),
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldValue && typeof oldValue === "object" ? (oldValue as Record<string, unknown>) : null,
    new_value: newValue && typeof newValue === "object" ? (newValue as Record<string, unknown>) : null,
    created_at: nowIso()
  });
}
