"use client";

import { useEffect } from "react";
import {
  expandApp,
  getTelegramThemeParams,
  getTelegramWebApp,
  readyApp
} from "@/lib/telegram/webapp";

function hexToRgb(value?: string) {
  if (!value || !value.startsWith("#")) {
    return null;
  }

  const clean = value.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : clean;

  if (normalized.length !== 6) {
    return null;
  }

  const number = Number.parseInt(normalized, 16);
  return `${(number >> 16) & 255} ${(number >> 8) & 255} ${number & 255}`;
}

export function AppBootstrap() {
  useEffect(() => {
    readyApp();
    expandApp();

    const theme = getTelegramThemeParams();
    const root = document.documentElement;
    const bg = hexToRgb(theme.bg_color);
    const text = hexToRgb(theme.text_color);
    const card = hexToRgb(theme.secondary_bg_color);
    const accent = hexToRgb(theme.button_color);
    const accentText = hexToRgb(theme.button_text_color);

    if (bg) root.style.setProperty("--app-bg", bg);
    if (text) root.style.setProperty("--app-text", text);
    if (card) root.style.setProperty("--app-card", card);
    if (accent) root.style.setProperty("--app-accent", accent);
    if (accentText) root.style.setProperty("--app-accent-text", accentText);

    const webApp = getTelegramWebApp();
    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: webApp?.initData ?? "" })
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.user?.id) {
          window.localStorage.setItem("katnut_user_id", payload.user.id);
          window.dispatchEvent(new CustomEvent("katnut-user-ready", { detail: payload.user }));
        }
      })
      .catch(() => {
        window.localStorage.setItem(
          "katnut_user_id",
          "00000000-0000-4000-8000-000000000001"
        );
      });
  }, []);

  return null;
}
