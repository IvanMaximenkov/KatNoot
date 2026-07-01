import { NextResponse } from "next/server";
import { AuthError, canManageClub, requireUser } from "@/lib/auth/permissions";
import { getClubById, getClubBySlug, getClubPageData, updateClub } from "@/lib/db/repository";
import { updateClubSchema } from "@/lib/db/schemas";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const data = await getClubPageData(params.id);
  if (data) {
    return NextResponse.json(data);
  }

  const club = await getClubById(params.id);
  if (club) {
    return NextResponse.json({ club });
  }

  const bySlug = await getClubBySlug(params.id);
  if (bySlug) {
    return NextResponse.json({ club: bySlug });
  }

  return NextResponse.json({ error: "Клуб не найден" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = updateClubSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте поля клуба" }, { status: 400 });
  }

  try {
    const actor = await requireUser(request, parsed.data.actor_user_id ?? null);
    const allowed = await canManageClub(actor.id, params.id);
    if (!allowed) {
      return NextResponse.json({ error: "Нет прав на управление клубом" }, { status: 403 });
    }
    const { actor_user_id: _actorUserId, ...updates } = parsed.data;
    const club = await updateClub(params.id, updates, actor.id);
    return NextResponse.json({ club });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось обновить клуб" },
      { status: 400 }
    );
  }
}
