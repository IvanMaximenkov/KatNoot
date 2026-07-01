import { ClubApplicationForm } from "@/components/ClubApplicationForm";

export const dynamic = "force-dynamic";

export default function ClubApplyPage() {
  return (
    <div className="px-4 pt-4">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
          Модерация клуба
        </p>
        <h1 className="mt-1 text-3xl font-black">Заявка на клуб</h1>
        <p className="mt-2 text-sm text-app-muted">
          Клуб появится публично после проверки. Это защищает ленту от пустых и случайных страниц.
        </p>
      </header>
      <ClubApplicationForm />
    </div>
  );
}
