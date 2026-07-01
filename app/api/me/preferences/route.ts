import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { updateUserPreferences } from "@/lib/db/repository";
import { userPreferencesSchema } from "@/lib/db/schemas";

export async function PATCH(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = userPreferencesSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные предпочтения" }, { status: 400 });
  }

  if (parsed.data.preferred_pace_min > parsed.data.preferred_pace_max) {
    return NextResponse.json({ error: "Темп от не может быть выше темпа до" }, { status: 400 });
  }

  try {
    const user = await requireUser(request, typeof json?.user_id === "string" ? json.user_id : null);
    const updated = await updateUserPreferences(user.id, parsed.data);
    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось сохранить предпочтения" }, { status: 400 });
  }
}
