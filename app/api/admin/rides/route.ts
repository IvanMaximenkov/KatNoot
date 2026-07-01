import { NextResponse } from "next/server";
import { AuthError, requireSuperAdmin } from "@/lib/auth/permissions";
import { listAdminRides } from "@/lib/db/repository";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request, request.headers.get("x-demo-user-id"));
    const rides = await listAdminRides();
    return NextResponse.json({ rides });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось получить заезды" }, { status: 400 });
  }
}
