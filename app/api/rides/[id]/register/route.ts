import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/permissions";
import { getRideDetail, upsertRideRegistration } from "@/lib/db/repository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => ({}));
  const status = json?.status === "maybe" ? "maybe" : "going";

  try {
    const user = await requireUser(request, typeof json?.user_id === "string" ? json.user_id : null);
    const registration = await upsertRideRegistration(params.id, user.id, status);
    const detail = await getRideDetail(params.id, true);
    return NextResponse.json({
      registration,
      participant_count: detail?.participant_count ?? 0,
      maybe_count: detail?.maybe_count ?? 0
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось записаться" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json().catch(() => ({}));

  try {
    const user = await requireUser(request, typeof json?.user_id === "string" ? json.user_id : null);
    const registration = await upsertRideRegistration(params.id, user.id, "cancelled");
    const detail = await getRideDetail(params.id, true);
    return NextResponse.json({
      registration,
      participant_count: detail?.participant_count ?? 0,
      maybe_count: detail?.maybe_count ?? 0
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Не удалось отменить участие" }, { status: 400 });
  }
}
