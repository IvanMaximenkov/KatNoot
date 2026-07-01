import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { markNotificationRead } from "@/lib/db/repository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => ({}));

  try {
    const user = await requireUser(request, typeof json?.user_id === "string" ? json.user_id : null);
    const notification = await markNotificationRead(params.id, user.id);
    return NextResponse.json({ notification });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось отметить уведомление" }, { status: 400 });
  }
}
