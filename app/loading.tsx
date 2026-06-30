export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full rounded-lg border border-app-stroke bg-app-card p-5 text-center shadow-soft">
        <p className="text-sm font-semibold">Загружаем заезды</p>
        <p className="mt-1 text-xs text-app-muted">Сейчас подберём ближайшие старты.</p>
      </div>
    </div>
  );
}
