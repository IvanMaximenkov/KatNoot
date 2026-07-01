import { NextResponse } from "next/server";
import { AuthError, requireSuperAdmin } from "@/lib/auth/permissions";
import { updateClubStatus } from "@/lib/db/repository";
import { updateClubSchema } from "@/lib/db/schemas";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = updateClubSchema.pick({ actor_user_id: true, status: true }).safeParse(json);
  if (!parsed.success || !parsed.data.status) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }

  try {
    const admin = await requireSuperAdmin(request, parsed.data.actor_user_id ?? null);
    const club = await updateClubStatus(params.id, parsed.data.status, admin.id);
    return NextResponse.json({ club });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось изменить статус клуба" }, { status: 400 });
  }
}
