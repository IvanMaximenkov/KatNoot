import { NextResponse } from "next/server";
import { AuthError, requireSuperAdmin } from "@/lib/auth/permissions";
import { listAdminClubs } from "@/lib/db/repository";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request, request.headers.get("x-demo-user-id"));
    const clubs = await listAdminClubs();
    return NextResponse.json({ clubs });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось получить клубы" }, { status: 400 });
  }
}
