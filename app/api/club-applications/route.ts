import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { listClubApplications, submitClubApplication } from "@/lib/db/repository";
import { clubApplicationSchema } from "@/lib/db/schemas";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const applications = await listClubApplications({ userId: user.id });
    return NextResponse.json({ applications });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось получить заявки" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = clubApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля заявки", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const user = await requireUser(request, parsed.data.applicant_user_id ?? null);
    const application = await submitClubApplication({
      ...parsed.data,
      applicant_user_id: user.id
    });
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось отправить заявку" },
      { status: 400 }
    );
  }
}
