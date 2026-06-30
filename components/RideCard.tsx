import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Route, Users } from "lucide-react";
import { Badge } from "@/components/Badge";
import { bikeTypeLabels, levelLabels, rideTypeLabels } from "@/lib/labels";
import { formatRideDate } from "@/lib/format";
import type { RideWithClub } from "@/lib/types";

export function RideCard({ ride, compact = false }: { ride: RideWithClub; compact?: boolean }) {
  return (
    <article className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
            {ride.club.name}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-tight">{ride.title}</h2>
        </div>
        <Badge tone={ride.no_drop ? "green" : "amber"}>
          {ride.no_drop ? "No-drop" : "Темп"}
        </Badge>
      </div>

      {!compact && <p className="mt-3 line-clamp-2 text-sm text-app-muted">{ride.description}</p>}

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-app-muted">
          <Clock3 size={16} className="text-app-accent" />
          <span>{formatRideDate(ride.date_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-app-muted">
          <Route size={16} className="text-app-accent" />
          <span>{ride.distance_km} км</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-app-muted">
          <MapPin size={16} className="text-app-accent" />
          <span className="truncate">{ride.start_location_name}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="blue">{levelLabels[ride.level]}</Badge>
        <Badge tone="gray">{rideTypeLabels[ride.ride_type]}</Badge>
        <Badge tone="gray">{bikeTypeLabels[ride.bike_type]}</Badge>
        <Badge tone="amber">
          {ride.pace_min_kmh}-{ride.pace_max_kmh} км/ч
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-app-stroke pt-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-app-muted">
          <Users size={16} />
          <span>
            {ride.participant_count}
            {ride.max_participants ? `/${ride.max_participants}` : ""} едут
          </span>
        </div>
        <Link
          href={`/rides/${ride.id}`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-app-accent px-3 text-sm font-semibold text-app-accentText"
        >
          Подробнее
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
