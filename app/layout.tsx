import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { BottomNav } from "@/components/BottomNav";
import { AppBootstrap } from "@/components/AppBootstrap";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Катнуть",
  description: "Telegram Mini App для московских велозаездов",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1d7c5c"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <AppBootstrap />
        <main className="mx-auto min-h-screen w-full max-w-md safe-bottom">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
