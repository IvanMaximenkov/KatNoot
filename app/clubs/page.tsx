import { ClubCard } from "@/components/ClubCard";
import { listClubs } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const clubs = await listClubs();

  return (
    <div className="px-4 pt-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
          Московские сообщества
        </p>
        <h1 className="mt-1 text-3xl font-black">Клубы</h1>
        <p className="mt-2 text-sm text-app-muted">
          Выбирайте компанию по стилю: кофе, гравел, ночь, новичковые заезды или темп.
        </p>
      </header>

      <section className="mt-5 space-y-3">
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </section>
    </div>
  );
}
