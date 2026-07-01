import { z } from "zod";

const nullableUrl = z
  .preprocess((value) => (value === "" ? null : value), z.string().url().nullable().optional())
  .or(z.literal(""));

const safeText = (min = 1, max = 2000) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((value) => !/[<>]/.test(value), "HTML-теги не поддерживаются");

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug должен состоять из латиницы, цифр и дефисов");

export const createRideSchema = z.object({
  club_id: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().min(1).nullable().optional()
  ),
  creator_user_id: z.string().min(1).optional(),
  title: safeText(3, 120),
  description: safeText(10, 2000),
  date_time: z.string().min(1),
  start_location_name: safeText(2, 120),
  start_lat: z.coerce.number().min(-90).max(90),
  start_lng: z.coerce.number().min(-180).max(180),
  finish_location_name: z.string().trim().max(120).nullable().optional(),
  finish_lat: z.coerce.number().min(-90).max(90).nullable().optional(),
  finish_lng: z.coerce.number().min(-180).max(180).nullable().optional(),
  distance_km: z.coerce.number().min(1).max(500),
  pace_min_kmh: z.coerce.number().min(5).max(60),
  pace_max_kmh: z.coerce.number().min(5).max(60),
  level: z.enum(["beginner", "casual", "easy", "intermediate", "medium", "advanced", "hard", "sport"]),
  ride_type: z.enum([
    "coffee",
    "city",
    "training",
    "gravel",
    "road",
    "night",
    "social",
    "mtb",
    "long"
  ]),
  bike_type: z.enum(["road", "gravel", "mtb", "city", "fixed", "any"]),
  no_drop: z.coerce.boolean(),
  max_participants: z.coerce.number().int().min(1).max(300).nullable().optional(),
  rules: z.string().trim().max(1200).nullable().optional(),
  what_to_bring: z.string().trim().max(1200).nullable().optional(),
  route_id: z.string().min(1).nullable().optional(),
  route_url: nullableUrl,
  telegram_chat_url: nullableUrl,
  route_payload: z
    .object({
      title: z.string().trim().min(2).max(120),
      source_type: z.enum(["manual", "gpx_upload", "komoot_gpx", "external_url", "demo"]),
      original_url: z.string().url().nullable().optional(),
      file_name: z.string().trim().max(180).nullable().optional(),
      geometry_geojson: z
        .object({
          type: z.literal("LineString"),
          coordinates: z.array(z.tuple([z.number(), z.number()])).min(2)
        })
        .nullable()
        .optional(),
      distance_km: z.coerce.number().min(0).max(1000).nullable().optional(),
      elevation_gain_m: z.coerce.number().min(0).max(20000).nullable().optional()
    })
    .optional()
});

export const updateRideSchema = createRideSchema.partial().extend({
  actor_user_id: z.string().min(1).optional(),
  status: z.enum(["draft", "published", "active", "cancelled", "finished", "archived"]).optional()
});

export const cancelRideSchema = z.object({
  actor_user_id: z.string().min(1).optional(),
  cancellation_reason: safeText(3, 500)
});

export const registrationSchema = z.object({
  ride_id: z.string().min(1),
  user_id: z.string().min(1).optional(),
  status: z.enum(["going", "maybe", "cancelled"])
});

export const userPreferencesSchema = z.object({
  cycling_level: z.enum(["beginner", "casual", "easy", "intermediate", "medium", "advanced", "hard", "sport"]),
  bike_type: z.enum(["road", "gravel", "mtb", "city", "fixed", "any"]),
  preferred_pace_min: z.coerce.number().min(5).max(60),
  preferred_pace_max: z.coerce.number().min(5).max(60)
});

export const clubApplicationSchema = z.object({
  applicant_user_id: z.string().min(1).optional(),
  proposed_name: safeText(3, 120),
  proposed_slug: slugSchema,
  description: safeText(20, 2000),
  telegram_url: z.string().url().refine((value) => value.includes("t.me") || value.includes("telegram.me"), {
    message: "Нужна Telegram-ссылка"
  }),
  proof_text: safeText(10, 1500),
  proof_links: z.array(z.string().url()).max(5).default([]),
  city: safeText(2, 80).default("Москва"),
  tags: z.array(z.string().trim().min(1).max(32)).max(10).default([])
});

export const moderateApplicationSchema = z.object({
  actor_user_id: z.string().min(1).optional(),
  admin_comment: z.string().trim().max(1000).nullable().optional()
});

export const updateClubSchema = z.object({
  actor_user_id: z.string().min(1).optional(),
  name: safeText(3, 120).optional(),
  description: safeText(10, 2000).optional(),
  telegram_url: nullableUrl,
  tags: z.array(z.string().trim().min(1).max(32)).max(10).optional(),
  status: z.enum(["pending", "active", "rejected", "suspended", "archived"]).optional()
});

export const clubMemberSchema = z.object({
  actor_user_id: z.string().min(1).optional(),
  user_id: z.string().min(1),
  role: z.enum([
    "club_owner",
    "club_admin",
    "club_organizer",
    "club_member",
    "banned",
    "admin",
    "organizer",
    "member"
  ])
});

export const updateUserRoleSchema = z.object({
  actor_user_id: z.string().min(1).optional(),
  global_role: z.enum(["rider", "verified_organizer", "super_admin"])
});

export const routeSchema = z.object({
  created_by_user_id: z.string().min(1).optional(),
  title: safeText(2, 120),
  source_type: z.enum(["manual", "gpx_upload", "komoot_gpx", "external_url", "demo"]),
  original_url: z.string().url().nullable().optional(),
  file_name: z.string().trim().max(180).nullable().optional(),
  geometry_geojson: z
    .object({
      type: z.literal("LineString"),
      coordinates: z.array(z.tuple([z.number(), z.number()])).min(2)
    })
    .nullable()
    .optional(),
  distance_km: z.coerce.number().min(0).max(1000).nullable().optional(),
  elevation_gain_m: z.coerce.number().min(0).max(20000).nullable().optional()
});

export const reportUpdateSchema = z.object({
  actor_user_id: z.string().min(1).optional(),
  status: z.enum(["open", "resolved", "rejected"]).optional(),
  admin_comment: z.string().trim().max(1000).nullable().optional()
});
