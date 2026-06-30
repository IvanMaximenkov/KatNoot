import { NextResponse } from "next/server";
import { updateUserPreferences } from "@/lib/db/repository";
import { userPreferencesSchema } from "@/lib/db/schemas";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => null);
  const parsed = userPreferencesSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные предпочтения" }, { status: 400 });
  }

  if (parsed.data.preferred_pace_min > parsed.data.preferred_pace_max) {
    return NextResponse.json({ error: "Темп от не может быть выше темпа до" }, { status: 400 });
  }

  const user = await updateUserPreferences(params.id, parsed.data);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
