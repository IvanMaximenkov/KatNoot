import { NextResponse } from "next/server";
import { AuthError, canManageClub, requireUser } from "@/lib/auth/permissions";
import { getClubPageData, upsertClubMember } from "@/lib/db/repository";
import { clubMemberSchema } from "@/lib/db/schemas";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const data = await getClubPageData(params.id);
  if (!data) {
    return NextResponse.json({ error: "Клуб не найден" }, { status: 404 });
  }
  return NextResponse.json({ members: data.members });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = clubMemberSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректная роль" }, { status: 400 });
  }

  try {
    const actor = await requireUser(request, parsed.data.actor_user_id ?? null);
    const allowed = await canManageClub(actor.id, params.id);
    if (!allowed) {
      return NextResponse.json({ error: "Нет прав на управление ролями клуба" }, { status: 403 });
    }
    const member = await upsertClubMember(params.id, parsed.data.user_id, parsed.data.role, actor.id);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось сохранить роль" }, { status: 400 });
  }
}
