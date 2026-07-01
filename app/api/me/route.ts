import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { getProfileData } from "@/lib/db/repository";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const profile = await getProfileData(user.id);
    return NextResponse.json({ user, profile });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось получить профиль" }, { status: 400 });
  }
}
