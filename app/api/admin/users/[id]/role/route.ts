import { NextResponse } from "next/server";
import { AuthError, requireSuperAdmin } from "@/lib/auth/permissions";
import { updateUserRole } from "@/lib/db/repository";
import { updateUserRoleSchema } from "@/lib/db/schemas";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = updateUserRoleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректная роль" }, { status: 400 });
  }

  try {
    const admin = await requireSuperAdmin(request, parsed.data.actor_user_id ?? null);
    const user = await updateUserRole(params.id, parsed.data.global_role, admin.id);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось изменить роль" },
      { status: 400 }
    );
  }
}
