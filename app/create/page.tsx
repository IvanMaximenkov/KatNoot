import { CreateRideForm } from "@/components/CreateRideForm";
import { listClubs } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function CreateRidePage() {
  const clubs = await listClubs();

  return (
    <div className="px-4 pt-4">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
          Организаторский режим
        </p>
        <h1 className="mt-1 text-3xl font-black">Создать заезд</h1>
        <p className="mt-2 text-sm text-app-muted">
          Заполните маршрут, темп и правила. После создания появится готовый текст для чата.
        </p>
      </header>
      <CreateRideForm clubs={clubs} />
    </div>
  );
}
