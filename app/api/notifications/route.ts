import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { listNotifications } from "@/lib/db/repository";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request, request.headers.get("x-demo-user-id"));
    const notifications = await listNotifications(user.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось получить уведомления" }, { status: 400 });
  }
}
