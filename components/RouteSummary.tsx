import { Route } from "lucide-react";
import type { RouteDraft } from "@/lib/types";

export function RouteSummary({ route }: { route: RouteDraft | null }) {
  if (!route) {
    return (
      <p className="rounded-lg border border-dashed border-app-stroke bg-app-bg/70 p-3 text-sm font-semibold text-app-muted">
        Маршрут пока не добавлен. Можно оставить внешнюю ссылку или построить линию на карте.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-app-stroke bg-emerald-50 p-3 text-emerald-800">
      <div className="flex items-center gap-2 text-sm font-black">
        <Route size={16} />
        {route.title}
      </div>
      <p className="mt-1 text-xs font-semibold">
        {route.distance_km ? `${route.distance_km} км · ` : ""}
        {route.source_type === "manual"
          ? "построен вручную"
          : route.source_type === "gpx_upload" || route.source_type === "komoot_gpx"
            ? "загружен из GPX"
            : "внешняя ссылка"}
      </p>
    </div>
  );
}
