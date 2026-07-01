import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { getRideDetail, upsertRideRegistration } from "@/lib/db/repository";
import { registrationSchema } from "@/lib/db/schemas";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  try {
    const user = await requireUser(request, parsed.data.user_id ?? null);
    const registration = await upsertRideRegistration(
      parsed.data.ride_id,
      user.id,
      parsed.data.status
    );
    const detail = await getRideDetail(parsed.data.ride_id, true);

    return NextResponse.json({
      registration,
      participant_count: detail?.participant_count ?? 0,
      maybe_count: detail?.maybe_count ?? 0
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось обновить участие" }, { status: 400 });
  }
}
