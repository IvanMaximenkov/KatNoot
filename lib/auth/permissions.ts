import { demoUser } from "@/lib/demo-data";
import {
  canCreateRide,
  canEditRide,
  canManageClub,
  canModerateApplication,
  getUserById,
  upsertTelegramUser
} from "@/lib/db/repository";
import { validateTelegramInitData } from "@/lib/telegram/validate-init-data";
import type { User } from "@/lib/types";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentUserFromTelegramInitData(request: Request) {
  const initData =
    request.headers.get("x-telegram-init-data") || request.headers.get("telegram-init-data");

  if (!initData) {
    return null;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new AuthError("TELEGRAM_BOT_TOKEN is not configured on the server.", 500);
  }

  const validated = validateTelegramInitData(initData, botToken);
  if (!validated.ok) {
    throw new AuthError(validated.error, 401);
  }

  return upsertTelegramUser(validated.user);
}

export async function requireUser(request: Request, fallbackUserId?: string | null): Promise<User> {
  const telegramUser = await getCurrentUserFromTelegramInitData(request);
  if (telegramUser) {
    return telegramUser;
  }

  const demoHeader = request.headers.get("x-demo-user-id") || request.headers.get("x-katnut-user-id");
  const candidateId = fallbackUserId || demoHeader || demoUser.id;
  const user = await getUserById(candidateId);
  if (!user) {
    throw new AuthError("Пользователь не найден", 401);
  }

  return user;
}

export async function requireSuperAdmin(request: Request, fallbackUserId?: string | null) {
  const user = await requireUser(request, fallbackUserId);
  if (user.global_role !== "super_admin") {
    throw new AuthError("Нет доступа", 403);
  }

  return user;
}

export {
  canCreateRide,
  canEditRide,
  canManageClub,
  canModerateApplication
};
