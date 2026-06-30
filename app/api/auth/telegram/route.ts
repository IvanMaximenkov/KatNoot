import { NextResponse } from "next/server";
import { ensureDemoUser, upsertTelegramUser } from "@/lib/db/repository";
import { validateTelegramInitData } from "@/lib/telegram/validate-init-data";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { initData?: string };

  if (!body.initData) {
    const user = await ensureDemoUser();
    return NextResponse.json({ user, isDemo: true });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN is not configured on the server." },
      { status: 500 }
    );
  }

  const validated = validateTelegramInitData(body.initData, botToken);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 401 });
  }

  const user = await upsertTelegramUser(validated.user);
  return NextResponse.json({ user, isDemo: false });
}
