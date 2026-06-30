import { z } from "zod";

export const createRideSchema = z.object({
  club_id: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().min(1).nullable().optional()
  ),
  creator_user_id: z.string().min(1).optional(),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  date_time: z.string().min(1),
  start_location_name: z.string().min(2).max(120),
  start_lat: z.coerce.number().min(-90).max(90),
  start_lng: z.coerce.number().min(-180).max(180),
  finish_location_name: z.string().max(120).nullable().optional(),
  finish_lat: z.coerce.number().min(-90).max(90).nullable().optional(),
  finish_lng: z.coerce.number().min(-180).max(180).nullable().optional(),
  distance_km: z.coerce.number().min(1).max(500),
  pace_min_kmh: z.coerce.number().min(5).max(60),
  pace_max_kmh: z.coerce.number().min(5).max(60),
  level: z.enum(["beginner", "casual", "intermediate", "advanced", "sport"]),
  ride_type: z.enum([
    "coffee",
    "city",
    "training",
    "gravel",
    "road",
    "night"
  ]),
  bike_type: z.enum(["road", "gravel", "mtb", "city", "fixed", "any"]),
  no_drop: z.coerce.boolean(),
  max_participants: z.coerce.number().int().min(1).max(300).nullable().optional(),
  rules: z.string().max(1200).nullable().optional(),
  what_to_bring: z.string().max(1200).nullable().optional(),
  route_url: z.string().url().nullable().optional().or(z.literal("")),
  telegram_chat_url: z.string().url().nullable().optional().or(z.literal(""))
});

export const registrationSchema = z.object({
  ride_id: z.string().min(1),
  user_id: z.string().min(1).optional(),
  status: z.enum(["going", "maybe", "cancelled"])
});

export const userPreferencesSchema = z.object({
  cycling_level: z.enum(["beginner", "casual", "intermediate", "advanced", "sport"]),
  bike_type: z.enum(["road", "gravel", "mtb", "city", "fixed", "any"]),
  preferred_pace_min: z.coerce.number().min(5).max(60),
  preferred_pace_max: z.coerce.number().min(5).max(60)
});
