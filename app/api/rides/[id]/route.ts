import { NextResponse } from "next/server";
import { AuthError, canEditRide, requireUser } from "@/lib/auth/permissions";
import { getRideDetail, updateRide } from "@/lib/db/repository";
import { updateRideSchema } from "@/lib/db/schemas";

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
    const { actor_user_id: _actorUserId, route_payload: _routePayload, ...updates } = parsed.data;
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
