"use client";

import type { TelegramMiniAppUser } from "@/lib/types";

type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: {
    user?: TelegramMiniAppUser;
  };
  themeParams?: Record<string, string | undefined>;
  ready: () => void;
  expand: () => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  MainButton?: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.Telegram?.WebApp;
}

export function isTelegram() {
  return Boolean(getTelegramWebApp()?.initData);
}

export function getTelegramUser() {
  return getTelegramWebApp()?.initDataUnsafe?.user;
}

export function hapticFeedback(type: "light" | "success" | "warning" | "error" = "light") {
  const webApp = getTelegramWebApp();
  if (!webApp?.HapticFeedback) {
    return;
  }

  if (type === "light") {
    webApp.HapticFeedback.impactOccurred("light");
    return;
  }

  webApp.HapticFeedback.notificationOccurred(type);
}

export function expandApp() {
  getTelegramWebApp()?.expand();
}

export function readyApp() {
  getTelegramWebApp()?.ready();
}

export function getTelegramThemeParams() {
  return getTelegramWebApp()?.themeParams ?? {};
}
