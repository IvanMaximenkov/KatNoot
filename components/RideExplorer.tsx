"use client";

import { useMemo, useState } from "react";
import { Bike, SearchX } from "lucide-react";
import { FilterChips } from "@/components/FilterChips";
import { RideCard } from "@/components/RideCard";
import type { QuickFilter } from "@/lib/labels";
import type { RideWithClub } from "@/lib/types";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function matchesFilter(ride: RideWithClub, filter: QuickFilter | null) {
  if (!filter) {
    return true;
  }

  const rideDate = new Date(ride.date_time);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (filter === "Сегодня") return sameDay(rideDate, today);
  if (filter === "Завтра") return sameDay(rideDate, tomorrow);
  if (filter === "Выходные") return [0, 6].includes(rideDate.getDay());
  if (filter === "Новичкам") return ride.no_drop && ["beginner", "casual"].includes(ride.level);
  if (filter === "Коферайды") return ride.ride_type === "coffee";
  if (filter === "Шоссе") return ride.ride_type === "road" || ride.bike_type === "road";
  if (filter === "Гравел") return ride.ride_type === "gravel" || ride.bike_type === "gravel";
  if (filter === "Ночные") return ride.ride_type === "night";

  return true;
}

export function RideExplorer({ rides }: { rides: RideWithClub[] }) {
  const [activeFilter, setActiveFilter] = useState<QuickFilter | null>(null);
  const filteredRides = useMemo(
    () => rides.filter((ride) => matchesFilter(ride, activeFilter)),
    [rides, activeFilter]
  );

  return (
    <>
      <FilterChips activeFilter={activeFilter} onChange={setActiveFilter} className="mt-5" />

      <section className="mt-5 space-y-3">
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
        ) : (
          <div className="rounded-lg border border-dashed border-app-stroke bg-app-card p-6 text-center">
            <SearchX className="mx-auto text-app-accent" size={30} />
            <h2 className="mt-3 text-base font-bold">Под этот фильтр пока пусто</h2>
            <p className="mt-1 text-sm text-app-muted">
              Можно сбросить фильтр или создать новый заезд для своих.
            </p>
          </div>
        )}
      </section>

      <div className="mt-6 rounded-lg border border-app-stroke bg-app-card p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-100 text-amber-800">
            <Bike size={22} />
          </div>
          <div>
            <p className="text-sm font-bold">Сегодня можно просто катнуть</p>
            <p className="text-xs text-app-muted">
              MVP не трекает тренировки, он помогает найти компанию и старт.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
