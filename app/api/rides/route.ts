import { NextResponse } from "next/server";
import { AuthError, canCreateRide, requireUser } from "@/lib/auth/permissions";
import { createRide, createRoute, getRideDetail, listRides } from "@/lib/db/repository";
import { createRideSchema } from "@/lib/db/schemas";
import { validateRouteGeometry } from "@/lib/map/geojsonUtils";

export async function GET() {
  const rides = await listRides();
  return NextResponse.json({ rides });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = createRideSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля формы", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.pace_min_kmh > parsed.data.pace_max_kmh) {
    return NextResponse.json(
      { error: "Минимальный темп не может быть выше максимального" },
      { status: 400 }
    );
  }

  try {
    const actor = await requireUser(request, parsed.data.creator_user_id ?? null);
    const allowed = await canCreateRide(actor.id, parsed.data.club_id ?? null);
    if (!allowed) {
      return NextResponse.json(
        { error: "У вас нет прав на создание этого заезда" },
        { status: 403 }
      );
    }

    let routeId = parsed.data.route_id ?? null;
    let routeUrl = parsed.data.route_url || null;
    let distanceKm = parsed.data.distance_km;

    if (parsed.data.route_payload) {
      const routePayload = parsed.data.route_payload;
      const validation = routePayload.geometry_geojson
        ? validateRouteGeometry(routePayload.geometry_geojson, {
            allowLongDistance: parsed.data.ride_type === "long"
          })
        : null;
      if (validation && !validation.ok) {
        return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
      }
      const route = await createRoute({
        title: routePayload.title,
        source_type: routePayload.source_type,
        original_url: routePayload.original_url ?? null,
        file_name: routePayload.file_name ?? null,
        geometry_geojson: routePayload.geometry_geojson ?? null,
        simplified_geometry_geojson: validation?.ok ? validation.simplified : null,
        encoded_polyline: null,
        distance_km: validation?.ok ? validation.distanceKm : routePayload.distance_km ?? null,
        elevation_gain_m: routePayload.elevation_gain_m ?? null,
        bbox: validation?.ok ? validation.bbox : undefined,
        created_by_user_id: actor.id
      });
      routeId = route.id;
      routeUrl = route.original_url ?? routeUrl;
      distanceKm = route.distance_km ?? distanceKm;
    }

    const { route_payload: _routePayload, route_id: _rawRouteId, ...rideInput } = parsed.data;
    const ride = await createRide({
      ...rideInput,
      club_id: parsed.data.club_id ?? null,
      creator_user_id: actor.id,
      organizer_user_id: actor.id,
      route_id: routeId,
      route_url: routeUrl,
      telegram_chat_url: parsed.data.telegram_chat_url || null,
      finish_location_name: parsed.data.finish_location_name || null,
      finish_lat: parsed.data.finish_lat ?? null,
      finish_lng: parsed.data.finish_lng ?? null,
      distance_km: distanceKm,
      max_participants: parsed.data.max_participants ?? null,
      rules: parsed.data.rules || null,
      what_to_bring: parsed.data.what_to_bring || null,
      status: "published"
    });

    const detail = await getRideDetail(ride.id, true);
    return NextResponse.json({ ride: detail ?? ride }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось создать заезд" },
      { status: 400 }
    );
  }
}
