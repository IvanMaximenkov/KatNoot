import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { createRoute } from "@/lib/db/repository";
import { routeSchema } from "@/lib/db/schemas";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = routeSchema.safeParse(json);
  if (!parsed.success || !parsed.data.geometry_geojson) {
    return NextResponse.json({ error: "GPX должен быть распарсен в LineString" }, { status: 400 });
  }

  try {
    const user = await requireUser(request, parsed.data.created_by_user_id ?? null);
    const route = await createRoute({
      title: parsed.data.title,
      source_type: parsed.data.source_type === "komoot_gpx" ? "komoot_gpx" : "gpx_upload",
      original_url: parsed.data.original_url ?? null,
      file_name: parsed.data.file_name ?? null,
      geometry_geojson: parsed.data.geometry_geojson,
      encoded_polyline: null,
      distance_km: parsed.data.distance_km ?? null,
      elevation_gain_m: parsed.data.elevation_gain_m ?? null,
      created_by_user_id: user.id
    });
    return NextResponse.json({ route }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось сохранить GPX" }, { status: 400 });
  }
}
