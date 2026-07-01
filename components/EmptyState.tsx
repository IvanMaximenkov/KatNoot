import { SearchX } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-app-stroke bg-app-card p-5 text-center">
      <SearchX className="mx-auto text-app-accent" size={28} />
      <h2 className="mt-3 text-base font-black">{title}</h2>
      <p className="mt-1 text-sm text-app-muted">{body}</p>
    </div>
  );
}
