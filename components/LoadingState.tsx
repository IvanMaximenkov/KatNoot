import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Загрузка" }: { label?: string }) {
  return (
    <div className="rounded-lg border border-app-stroke bg-app-card p-5 text-center text-app-muted">
      <Loader2 className="mx-auto animate-spin text-app-accent" size={26} />
      <p className="mt-2 text-sm font-bold">{label}</p>
    </div>
  );
}
