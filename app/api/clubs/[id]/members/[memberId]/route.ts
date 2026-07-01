import { NextResponse } from "next/server";
import { AuthError, canManageClub, requireUser } from "@/lib/auth/permissions";
import { removeClubMember, upsertClubMember } from "@/lib/db/repository";
import { clubMemberSchema } from "@/lib/db/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
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
    return NextResponse.json({ member });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось обновить роль" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const actor = await requireUser(request, request.headers.get("x-demo-user-id"));
    const allowed = await canManageClub(actor.id, params.id);
    if (!allowed) {
      return NextResponse.json({ error: "Нет прав на управление ролями клуба" }, { status: 403 });
    }
    await removeClubMember(params.id, params.memberId, actor.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось удалить роль" }, { status: 400 });
  }
}
