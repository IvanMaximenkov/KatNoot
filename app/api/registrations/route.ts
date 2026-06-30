import { NextResponse } from "next/server";
import { demoUser } from "@/lib/demo-data";
import { getRideDetail, upsertRideRegistration } from "@/lib/db/repository";
import { registrationSchema } from "@/lib/db/schemas";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const userId = parsed.data.user_id ?? demoUser.id;
  const registration = await upsertRideRegistration(
    parsed.data.ride_id,
    userId,
    parsed.data.status
  );
  const detail = await getRideDetail(parsed.data.ride_id);

  return NextResponse.json({
    registration,
    participant_count: detail?.participant_count ?? 0,
    maybe_count: detail?.maybe_count ?? 0
  });
}
