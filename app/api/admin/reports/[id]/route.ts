import { NextResponse } from "next/server";
import { AuthError, requireSuperAdmin } from "@/lib/auth/permissions";
import { updateReport } from "@/lib/db/repository";
import { reportUpdateSchema } from "@/lib/db/schemas";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = reportUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный статус жалобы" }, { status: 400 });
  }

  try {
    const admin = await requireSuperAdmin(request, parsed.data.actor_user_id ?? null);
    const { actor_user_id: _actorUserId, ...updates } = parsed.data;
    const report = await updateReport(params.id, updates, admin.id);
    return NextResponse.json({ report });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось обновить жалобу" }, { status: 400 });
  }
}
