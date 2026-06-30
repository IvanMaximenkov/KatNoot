export type CyclingLevel =
  | "beginner"
  | "casual"
  | "intermediate"
  | "advanced"
  | "sport";

export type BikeType = "road" | "gravel" | "mtb" | "city" | "fixed" | "any";

export type RideType =
  | "coffee"
  | "city"
  | "training"
  | "gravel"
  | "road"
  | "night";

export type RideStatus = "active" | "cancelled" | "finished";
export type ClubRole = "admin" | "organizer" | "member";
export type RegistrationStatus = "going" | "maybe" | "cancelled";
export type MapPointType =
  | "bike_lane"
  | "scenic"
  | "repair"
  | "water"
  | "cafe"
  | "warning";

export interface User {
  id: string;
  telegram_id: string | null;
  username: string | null;
  first_name: string;
  photo_url: string | null;
  cycling_level: CyclingLevel;
  bike_type: BikeType;
  preferred_pace_min: number;
  preferred_pace_max: number;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  telegram_url: string | null;
  city: string;
  sport_type: "cycling";
  tags: string[];
  created_at: string;
}

export interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  role: ClubRole;
  created_at: string;
}

export interface Ride {
  id: string;
  club_id: string | null;
  creator_user_id: string;
  title: string;
  description: string;
  date_time: string;
  start_location_name: string;
  start_lat: number;
  start_lng: number;
  finish_location_name: string | null;
  finish_lat: number | null;
  finish_lng: number | null;
  distance_km: number;
  pace_min_kmh: number;
  pace_max_kmh: number;
  level: CyclingLevel;
  ride_type: RideType;
  bike_type: BikeType;
  no_drop: boolean;
  max_participants: number | null;
  rules: string | null;
  what_to_bring: string | null;
  route_url: string | null;
  telegram_chat_url: string | null;
  status: RideStatus;
  created_at: string;
}

export interface RideRegistration {
  id: string;
  ride_id: string;
  user_id: string;
  status: RegistrationStatus;
  created_at: string;
}

export interface MapPoint {
  id: string;
  title: string;
  description: string;
  type: MapPointType;
  lat: number;
  lng: number;
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

export interface TelegramMiniAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}
