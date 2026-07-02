import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { deleteRoute, getRouteById, updateRoute } from "@/lib/db/repository";
import { routeSchema } from "@/lib/db/schemas";
import { validateRouteGeometry } from "@/lib/map/geojsonUtils";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const route = await getRouteById(params.id);
  if (!route) {
    return NextResponse.json({ error: "Маршрут не найден" }, { status: 404 });
  }
  return NextResponse.json({ route });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = routeSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте поля маршрута" }, { status: 400 });
  }

  try {
    await requireUser(request, parsed.data.created_by_user_id ?? null);
    if (parsed.data.geometry_geojson) {
      const validation = validateRouteGeometry(parsed.data.geometry_geojson);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
      }
      parsed.data.simplified_geometry_geojson = validation.simplified;
      parsed.data.distance_km = validation.distanceKm;
      parsed.data.bbox = validation.bbox;
    }
    const route = await updateRoute(params.id, parsed.data);
    return NextResponse.json({ route });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось обновить маршрут" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser(request, request.headers.get("x-demo-user-id"));
    await deleteRoute(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось удалить маршрут" }, { status: 400 });
  }
}
