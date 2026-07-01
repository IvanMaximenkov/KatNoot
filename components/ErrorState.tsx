import { AlertCircle } from "lucide-react";

export function ErrorState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">
      <AlertCircle size={24} />
      <h2 className="mt-2 text-base font-black">{title}</h2>
      <p className="mt-1 text-sm font-semibold">{body}</p>
    </div>
  );
}
