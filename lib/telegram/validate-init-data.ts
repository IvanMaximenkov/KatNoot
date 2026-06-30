import { createHmac, timingSafeEqual } from "crypto";
import type { TelegramMiniAppUser } from "@/lib/types";

export type TelegramValidationResult =
  | {
      ok: true;
      user: TelegramMiniAppUser;
    }
  | {
      ok: false;
      error: string;
    };

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86400
): TelegramValidationResult {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    return { ok: false, error: "Telegram hash is missing." };
  }

  params.delete("hash");

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) {
    return { ok: false, error: "Telegram auth_date is missing." };
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > maxAgeSeconds) {
    return { ok: false, error: "Telegram initData is expired." };
  }

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = createHmac("sha256", secret).update(dataCheckString).digest("hex");

  const hashBuffer = Buffer.from(hash, "hex");
  const calculatedBuffer = Buffer.from(calculatedHash, "hex");

  if (
    hashBuffer.length !== calculatedBuffer.length ||
    !timingSafeEqual(hashBuffer, calculatedBuffer)
  ) {
    return { ok: false, error: "Telegram initData signature is invalid." };
  }

  const rawUser = params.get("user");
  if (!rawUser) {
    return { ok: false, error: "Telegram user is missing." };
  }

  try {
    return { ok: true, user: JSON.parse(rawUser) as TelegramMiniAppUser };
  } catch {
    return { ok: false, error: "Telegram user payload is invalid JSON." };
  }
}
