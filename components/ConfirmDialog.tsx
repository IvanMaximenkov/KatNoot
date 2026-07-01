"use client";

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-lg border border-app-stroke bg-app-card p-4">
      <h2 className="text-base font-black">{title}</h2>
      <p className="mt-1 text-sm text-app-muted">{body}</p>
      <button type="button" onClick={onConfirm} className="mt-3 h-10 w-full rounded-lg bg-app-accent text-sm font-bold text-app-accentText">
        {confirmLabel}
      </button>
    </div>
  );
}
