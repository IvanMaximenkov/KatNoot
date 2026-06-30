"use client";

import { useEffect } from "react";
import {
  expandApp,
  getTelegramThemeParams,
  getTelegramWebApp,
  readyApp
} from "@/lib/telegram/webapp";

type Rgb = [number, number, number];

function hexToRgb(value?: string): Rgb | null {
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
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

function rgbToCss(rgb: Rgb) {
  return rgb.join(" ");
}

function mixRgb(foreground: Rgb, background: Rgb, foregroundWeight: number): Rgb {
  return foreground.map((channel, index) =>
    Math.round(channel * foregroundWeight + background[index] * (1 - foregroundWeight))
  ) as Rgb;
}

function luminance([red, green, blue]: Rgb) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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

    if (bg) root.style.setProperty("--app-bg", rgbToCss(bg));
    if (text) root.style.setProperty("--app-text", rgbToCss(text));
    if (card) root.style.setProperty("--app-card", rgbToCss(card));
    if (accent) root.style.setProperty("--app-accent", rgbToCss(accent));
    if (accentText) root.style.setProperty("--app-accent-text", rgbToCss(accentText));

    if (bg && text) {
      const surface = card ?? bg;
      const darkTheme = luminance(bg) < 0.45;
      root.style.setProperty("--app-muted", rgbToCss(mixRgb(text, surface, darkTheme ? 0.62 : 0.5)));
      root.style.setProperty("--app-stroke", rgbToCss(mixRgb(text, surface, darkTheme ? 0.34 : 0.12)));
    }

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
