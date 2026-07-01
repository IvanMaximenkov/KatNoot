export type CyclingLevel =
  | "beginner"
  | "casual"
  | "easy"
  | "intermediate"
  | "medium"
  | "advanced"
  | "hard"
  | "sport";

export type BikeType = "road" | "gravel" | "mtb" | "city" | "fixed" | "any";

export type RideType =
  | "coffee"
  | "city"
  | "training"
  | "gravel"
  | "road"
  | "night"
  | "social"
  | "mtb"
  | "long";

export type GlobalRole = "rider" | "verified_organizer" | "super_admin";
export type RideStatus = "draft" | "published" | "active" | "cancelled" | "finished" | "archived";
export type RideVisibility = "public" | "unlisted" | "private";
export type OrganizerType = "personal" | "club";
export type ClubStatus = "pending" | "active" | "rejected" | "suspended" | "archived";
export type ClubRole =
  | "club_owner"
  | "club_admin"
  | "club_organizer"
  | "club_member"
  | "banned"
  | "admin"
  | "organizer"
  | "member";
export type ClubApplicationStatus = "pending" | "approved" | "rejected";
export type RegistrationStatus = "going" | "maybe" | "cancelled";
export type RouteSourceType = "manual" | "gpx_upload" | "komoot_gpx" | "external_url" | "demo";
export type ReportTargetType = "ride" | "club" | "user";
export type ReportStatus = "open" | "resolved" | "rejected";
export type MapPointType =
  | "bike_lane"
  | "bike_route"
  | "a_lane"
  | "parking"
  | "repair"
  | "water"
  | "dangerous_place"
  | "meeting_point"
  | "scenic"
  | "cafe"
  | "warning";

export interface GeoJsonLineString {
  type: "LineString";
  coordinates: Array<[number, number]>;
}

export interface GeoJsonFeature {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry: GeoJsonLineString;
}

export interface User {
  id: string;
  telegram_id: string | null;
  username: string | null;
  telegram_username?: string | null;
  first_name: string;
  last_name?: string | null;
  photo_url: string | null;
  global_role?: GlobalRole;
  cycling_level: CyclingLevel;
  level?: CyclingLevel | null;
  bike_type: BikeType;
  preferred_pace_min: number;
  preferred_pace_max: number;
  comfortable_pace_min?: number | null;
  comfortable_pace_max?: number | null;
  home_area?: string | null;
  preferred_area?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  telegram_url: string | null;
  city: string;
  sport_type: "cycling";
  tags: string[];
  status?: ClubStatus;
  created_by_user_id?: string | null;
  approved_by_user_id?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: ClubRole;
  created_at: string;
  updated_at?: string | null;
}

export interface ClubApplication {
  id: string;
  applicant_user_id: string;
  proposed_name: string;
  proposed_slug: string;
  description: string;
  telegram_url: string;
  proof_text: string;
  proof_links: string[];
  city: string;
  tags: string[];
  status: ClubApplicationStatus;
  admin_comment: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Route {
  id: string;
  title: string;
  source_type: RouteSourceType;
  original_url: string | null;
  file_name: string | null;
  geometry_geojson: GeoJsonLineString | null;
  encoded_polyline: string | null;
  distance_km: number | null;
  elevation_gain_m: number | null;
  bbox: [number, number, number, number] | null;
  created_by_user_id: string;
  created_at: string;
  updated_at?: string | null;
}

export type RouteDraft = Pick<
  Route,
  "title" | "source_type" | "original_url" | "file_name" | "geometry_geojson" | "distance_km" | "elevation_gain_m"
>;

export interface RouteWaypoint {
  id: string;
  route_id: string;
  order_index: number;
  lat: number;
  lng: number;
  name: string | null;
}

export interface Ride {
  id: string;
  club_id: string | null;
  creator_user_id: string;
  organizer_user_id?: string;
  organizer_type?: OrganizerType;
  title: string;
  description: string;
  date_time: string;
  start_time?: string;
  end_time?: string | null;
  start_location_name: string;
  start_place_name?: string;
  start_lat: number;
  start_lng: number;
  finish_location_name: string | null;
  finish_place_name?: string | null;
  finish_lat: number | null;
  finish_lng: number | null;
  distance_km: number;
  elevation_gain_m?: number | null;
  pace_min_kmh: number;
  pace_max_kmh: number;
  pace_min?: number;
  pace_max?: number;
  level: CyclingLevel;
  ride_type: RideType;
  bike_type: BikeType;
  bike_types?: BikeType[];
  no_drop: boolean;
  max_participants: number | null;
  participant_limit?: number | null;
  rules: string | null;
  rules_list?: string[];
  what_to_bring: string | null;
  what_to_take?: string[];
  route_id?: string | null;
  route_url: string | null;
  telegram_chat_url: string | null;
  status: RideStatus;
  visibility?: RideVisibility;
  cancellation_reason?: string | null;
  last_changed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface RideRegistration {
  id: string;
  ride_id: string;
  user_id: string;
  status: RegistrationStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface MapPoint {
  id: string;
  title: string;
  description: string | null;
  type: MapPointType;
  lat: number;
  lng: number;
  geometry_geojson?: GeoJsonLineString | null;
  source?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ModerationReport {
  id: string;
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  admin_comment: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface RideOrganizer {
  type: "club" | "rider";
  name: string;
  description: string;
  href: string | null;
  photo_url: string | null;
}

export interface RideWithClub extends Ride {
  club: Club | null;
  route: Route | null;
  organizer: RideOrganizer;
  participant_count: number;
  maybe_count: number;
}

export interface RideDetail extends RideWithClub {
  participants: Array<RideRegistration & { user: User }>;
}

export interface ClubWithStats extends Club {
  upcoming_rides_count: number;
}

export interface ClubPageData {
  club: Club;
  upcomingRides: RideWithClub[];
  pastRides: RideWithClub[];
  members: Array<ClubMembership & { user: User }>;
  canManage: boolean;
}

export interface ProfileData {
  user: User;
  registeredRides: RideWithClub[];
  createdRides: RideWithClub[];
  clubs: Club[];
  applications: ClubApplication[];
  notifications: Notification[];
  memberships: ClubMembership[];
}

export interface AdminStats {
  users: number;
  clubs: Record<ClubStatus, number>;
  rides: Record<string, number>;
  registrations: number;
  latestApplications: ClubApplication[];
  latestReports: ModerationReport[];
}

export interface TelegramMiniAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}
