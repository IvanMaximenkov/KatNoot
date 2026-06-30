import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-app-accent">404</p>
      <h1 className="mt-2 text-2xl font-bold">Такого заезда нет</h1>
      <p className="mt-3 text-sm text-app-muted">
        Возможно, ссылку уже удалили или заезд перенесли.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-app-accent px-5 text-sm font-semibold text-app-accentText"
      >
        Вернуться к заездам
      </Link>
    </main>
  );
}
