import { Bike, CalendarDays } from "lucide-react";
import { RideExplorer } from "@/components/RideExplorer";
import { listRides } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rides = await listRides();

  return (
    <div className="px-4 pt-4">
      <header className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
              Москва · сегодня рядом
            </p>
            <h1 className="mt-1 text-3xl font-black">Катнуть</h1>
            <p className="mt-2 text-sm text-app-muted">
              Найдите компанию, старт и темп без спортивной бюрократии.
            </p>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-app-accent text-app-accentText">
            <Bike size={28} />
          </div>
        </div>
      </header>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Ближайшие заезды</p>
          <p className="text-xs text-app-muted">{rides.length} активных стартов</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-app-card px-3 py-2 text-xs font-semibold text-app-muted">
          <CalendarDays size={14} />
          Живой seed
        </div>
      </div>

      <RideExplorer rides={rides} />
    </div>
  );
}
