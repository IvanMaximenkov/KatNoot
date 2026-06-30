"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CirclePlus, Map, UsersRound, UserRound } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Заезды", icon: CalendarDays },
  { href: "/map", label: "Карта", icon: Map },
  { href: "/create", label: "Создать", icon: CirclePlus },
  { href: "/clubs", label: "Клубы", icon: UsersRound },
  { href: "/profile", label: "Профиль", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-app-stroke bg-app-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-12px_30px_rgb(15_23_42/0.08)] backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-h-14 flex-col items-center justify-center rounded-lg px-1 text-[11px] font-semibold transition",
                active ? "bg-app-accent text-app-accentText" : "text-app-muted"
              )}
            >
              <Icon aria-hidden size={20} strokeWidth={2.2} />
              <span className="mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
