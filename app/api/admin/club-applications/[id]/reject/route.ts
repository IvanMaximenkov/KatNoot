import { NextResponse } from "next/server";
import { AuthError, requireSuperAdmin } from "@/lib/auth/permissions";
import { moderateClubApplication } from "@/lib/db/repository";
import { moderateApplicationSchema } from "@/lib/db/schemas";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => ({}));
  const parsed = moderateApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный комментарий" }, { status: 400 });
  }

  try {
    const admin = await requireSuperAdmin(request, parsed.data.actor_user_id ?? null);
    const application = await moderateClubApplication(
      params.id,
      "reject",
      admin.id,
      parsed.data.admin_comment ?? null
    );
    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось отклонить заявку" },
      { status: 400 }
    );
  }
}
