import { NextResponse } from "next/server";
import { AuthError, canEditRide, requireUser } from "@/lib/auth/permissions";
import { createRoute, getRideDetail, updateRide } from "@/lib/db/repository";
import { updateRideSchema } from "@/lib/db/schemas";
import { validateRouteGeometry } from "@/lib/map/geojsonUtils";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const ride = await getRideDetail(params.id, true);
  if (!ride) {
    return NextResponse.json({ error: "Заезд не найден" }, { status: 404 });
  }
  return NextResponse.json({ ride });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = updateRideSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте поля заезда" }, { status: 400 });
  }

  try {
    const actor = await requireUser(request, parsed.data.actor_user_id ?? null);
    const allowed = await canEditRide(actor.id, params.id);
    if (!allowed) {
      return NextResponse.json({ error: "Нет прав на редактирование заезда" }, { status: 403 });
    }
    const { actor_user_id: _actorUserId, route_payload: routePayload, ...updates } = parsed.data;

    if (routePayload) {
      const validation = routePayload.geometry_geojson
        ? validateRouteGeometry(routePayload.geometry_geojson, {
            allowLongDistance: updates.ride_type === "long"
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

      updates.route_id = route.id;
      updates.route_url = route.original_url ?? updates.route_url ?? null;
      updates.distance_km = route.distance_km ?? updates.distance_km;
    }

    const ride = await updateRide(params.id, updates, actor.id);
    const detail = await getRideDetail(params.id, true);
    return NextResponse.json({ ride: detail ?? ride });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось обновить заезд" },
      { status: 400 }
    );
  }
}
