import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/Badge";
import { ClubAvatar } from "@/components/ClubAvatar";
import type { ClubWithStats } from "@/lib/types";

export function ClubCard({ club }: { club: ClubWithStats }) {
  return (
    <article className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <ClubAvatar club={club} />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">{club.name}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-app-muted">{club.description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {club.tags.map((tag) => (
          <Badge key={tag} tone={tag.includes("нович") || tag === "no-drop" ? "green" : "gray"}>
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-app-stroke pt-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-app-muted">
          <CalendarDays size={16} />
          <span>{club.upcoming_rides_count} ближайших</span>
        </div>
        <Link
          href={`/clubs/${club.slug}`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-app-accent px-3 text-sm font-semibold text-app-accentText"
        >
          Открыть
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
