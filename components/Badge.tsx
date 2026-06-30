import clsx from "clsx";

type BadgeTone = "green" | "amber" | "blue" | "red" | "gray";

const tones: Record<BadgeTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-800 ring-amber-100",
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
  red: "bg-rose-50 text-rose-700 ring-rose-100",
  gray: "bg-slate-50 text-slate-700 ring-slate-100"
};

export function Badge({
  children,
  tone = "gray",
  className
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
