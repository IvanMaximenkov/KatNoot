"use client";

export function MapLegend() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[520] flex justify-center px-3">
      <div className="pointer-events-auto inline-flex max-w-full items-center gap-3 overflow-x-auto rounded-lg border border-white/80 bg-white/[0.92] px-3 py-2 text-xs font-semibold text-slate-900 shadow-[0_10px_24px_rgb(15_23_42/0.12)] backdrop-blur-xl hide-scrollbar">
        <LegendItem swatch="bikeLanes" label="Велодорожки" />
        <LegendItem swatch="aLanes" label="А-полосы" />
        <LegendItem swatch="selectedRide" label="Маршрут заезда" />
        <LegendItem swatch="rideStart" label="Старт" />
      </div>
    </div>
  );
}

function LegendItem({
  swatch,
  label
}: {
  swatch: "bikeLanes" | "aLanes" | "selectedRide" | "rideStart";
  label: string;
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      <span className={`map-legend-line map-legend-line--${swatch}`} />
      {label}
    </span>
  );
}
