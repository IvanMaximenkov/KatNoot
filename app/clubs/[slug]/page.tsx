import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, HandHeart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/Badge";
import { ClubAvatar } from "@/components/ClubAvatar";
import { RideCard } from "@/components/RideCard";
import { getClubPageData } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function ClubDetailPage({ params }: { params: { slug: string } }) {
  const data = await getClubPageData(params.slug);
  if (!data) {
    notFound();
  }

  const { club, upcomingRides, pastRides } = data;

  return (
    <div className="px-4 pt-4">
      <header className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <ClubAvatar club={club} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
              {club.city} · {club.sport_type}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight">{club.name}</h1>
            <p className="mt-2 text-sm leading-relaxed text-app-muted">{club.description}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {club.tags.map((tag) => (
            <Badge key={tag} tone={tag.includes("нович") || tag === "no-drop" ? "green" : "gray"}>
              {tag}
            </Badge>
          ))}
        </div>
        {club.telegram_url && (
          <a
            href={club.telegram_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-app-accent text-sm font-bold text-app-accentText"
          >
            <MessageCircle size={17} />
            Telegram клуба
          </a>
        )}
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-app-card text-sm font-bold text-app-muted"
        >
          <Bell size={17} />
          Подписаться
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-app-card text-sm font-bold text-app-muted"
        >
          <HandHeart size={17} />
          Поддержать
        </button>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-black">Ближайшие заезды</h2>
        <div className="mt-3 space-y-3">
          {upcomingRides.length > 0 ? (
            upcomingRides.map((ride) => <RideCard key={ride.id} ride={ride} compact />)
          ) : (
            <p className="rounded-lg border border-dashed border-app-stroke bg-app-card p-4 text-sm text-app-muted">
              У клуба пока нет ближайших стартов.
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-app-stroke bg-app-card p-4">
        <h2 className="text-lg font-black">Прошедшие заезды</h2>
        <p className="mt-2 text-sm text-app-muted">
          История появится после первых завершенных заездов. Сейчас найдено: {pastRides.length}.
        </p>
      </section>

      <Link
        href="/clubs"
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border border-app-stroke bg-app-card text-sm font-bold"
      >
        Все клубы
      </Link>
    </div>
  );
}
