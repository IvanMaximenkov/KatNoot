import { CreateRideForm } from "@/components/CreateRideForm";
import { ensureDemoUser, listClubMemberships, listClubs } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function CreateRidePage() {
  const [clubs, memberships, initialUser] = await Promise.all([
    listClubs(),
    listClubMemberships(),
    ensureDemoUser()
  ]);

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
      <CreateRideForm clubs={clubs} memberships={memberships} initialUser={initialUser} />
    </div>
  );
}
