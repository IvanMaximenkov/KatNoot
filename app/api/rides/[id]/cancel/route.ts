import { NextResponse } from "next/server";
import { AuthError, canEditRide, requireUser } from "@/lib/auth/permissions";
import { cancelRide, getRideDetail } from "@/lib/db/repository";
import { cancelRideSchema } from "@/lib/db/schemas";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = cancelRideSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите причину отмены" }, { status: 400 });
  }

  try {
    const actor = await requireUser(request, parsed.data.actor_user_id ?? null);
    const allowed = await canEditRide(actor.id, params.id);
    if (!allowed) {
      return NextResponse.json({ error: "Нет прав на отмену заезда" }, { status: 403 });
    }
    await cancelRide(params.id, parsed.data.cancellation_reason, actor.id);
    const ride = await getRideDetail(params.id, true);
    return NextResponse.json({ ride });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось отменить заезд" },
      { status: 400 }
    );
  }
}
