import { NextResponse } from "next/server";
import { createRide, getRideDetail, listRides } from "@/lib/db/repository";
import { createRideSchema } from "@/lib/db/schemas";
import { demoUser } from "@/lib/demo-data";

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
    return NextResponse.json({ error: "Минимальный темп не может быть выше максимального" }, { status: 400 });
  }

  const ride = await createRide({
    ...parsed.data,
    creator_user_id: parsed.data.creator_user_id ?? demoUser.id,
    route_url: parsed.data.route_url || null,
    telegram_chat_url: parsed.data.telegram_chat_url || null,
    finish_location_name: parsed.data.finish_location_name || null,
    finish_lat: parsed.data.finish_lat ?? null,
    finish_lng: parsed.data.finish_lng ?? null,
    max_participants: parsed.data.max_participants ?? null,
    rules: parsed.data.rules || null,
    what_to_bring: parsed.data.what_to_bring || null
  });

  const detail = await getRideDetail(ride.id);
  return NextResponse.json({ ride: detail ?? ride }, { status: 201 });
}
