import type { Club } from "@/lib/types";

export function ClubAvatar({ club, size = "md" }: { club: Club; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-9 w-9 text-sm" : "h-12 w-12";
  const initials = club.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizeClass} grid shrink-0 place-items-center rounded-lg bg-app-accent font-black text-app-accentText`}
    >
      {initials}
    </div>
  );
}
