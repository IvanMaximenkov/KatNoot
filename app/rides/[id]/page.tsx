import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  MapPin,
  MessageCircle,
  Pencil,
  Route,
  ShieldCheck,
  XCircle,
  UserRound,
  Users
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { ClubAvatar } from "@/components/ClubAvatar";
import { MapPreview } from "@/components/MapPreview";
import { RegistrationActions } from "@/components/RegistrationActions";
import { ShareRideButton } from "@/components/ShareRideButton";
import { canEditRide, getRideDetail } from "@/lib/db/repository";
import { demoUser } from "@/lib/demo-data";
import {
  bikeTagLabels,
  levelTagLabels,
  registrationLabels,
  rideTypeLabels
} from "@/lib/labels";
import { formatRideDate, isBeginnerFriendly } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RideDetailPage({ params }: { params: { id: string } }) {
  const ride = await getRideDetail(params.id);
  if (!ride) {
    notFound();
  }

  const beginnerFriendly = isBeginnerFriendly(ride.level, ride.no_drop);
  const canManageRide = await canEditRide(demoUser.id, ride.id);

  return (
    <div className="px-4 pt-4">
      <header className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <Badge tone={beginnerFriendly ? "green" : "amber"}>
            {beginnerFriendly ? "Подходит новичкам" : "Не для новичков"}
          </Badge>
          {ride.no_drop && <Badge tone="green">No-drop: никого не бросаем</Badge>}
          {ride.status === "cancelled" && <Badge tone="red">Отменен</Badge>}
          {ride.route && <Badge tone="blue">Маршрут на карте</Badge>}
          <Badge tone="blue">{rideTypeLabels[ride.ride_type]}</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-black leading-tight">{ride.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-app-muted">{ride.description}</p>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <InfoTile icon={<CalendarDays size={18} />} label="Когда" value={formatRideDate(ride.date_time, "long")} />
        <InfoTile icon={<Route size={18} />} label="Дистанция" value={`${ride.distance_km} км`} />
        <InfoTile icon={<ShieldCheck size={18} />} label="Темп" value={`${ride.pace_min_kmh}-${ride.pace_max_kmh} км/ч`} />
        <InfoTile icon={<Users size={18} />} label="Участники" value={`${ride.participant_count}${ride.max_participants ? `/${ride.max_participants}` : ""}`} />
      </section>

      <section className="mt-4 rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <h2 className="text-base font-black">Старт</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-app-muted">
          <MapPin size={16} className="text-app-accent" />
          {ride.start_location_name}
        </p>
        <div className="mt-4">
          <MapPreview
            lat={ride.start_lat}
            lng={ride.start_lng}
            title={ride.title}
            route={ride.route?.geometry_geojson}
          />
        </div>
        {ride.route && (
          <p className="mt-3 text-xs font-semibold text-app-muted">
            Карта показывает примерную линию маршрута. Проверяйте дорожную обстановку перед стартом.
          </p>
        )}
      </section>

      {canManageRide && (
        <section className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/rides/${ride.id}/edit`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-app-accent text-sm font-bold text-app-accentText"
          >
            <Pencil size={16} />
            Редактировать
          </Link>
          <Link
            href={`/rides/${ride.id}/edit#cancel`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700"
          >
            <XCircle size={16} />
            Отменить
          </Link>
        </section>
      )}

      <RegistrationActions ride={ride} />

      <section className="mt-4 rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <h2 className="text-base font-black">Детали</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="blue">Уровень: {levelTagLabels[ride.level]}</Badge>
          <Badge tone="gray">Велосипед: {bikeTagLabels[ride.bike_type]}</Badge>
          <Badge tone="gray">{ride.status === "active" ? "Активен" : ride.status}</Badge>
        </div>
        {ride.rules && (
          <div className="mt-4">
            <p className="text-sm font-bold">Правила</p>
            <p className="mt-1 text-sm text-app-muted">{ride.rules}</p>
          </div>
        )}
        {ride.what_to_bring && (
          <div className="mt-4">
            <p className="text-sm font-bold">Что взять</p>
            <p className="mt-1 text-sm text-app-muted">{ride.what_to_bring}</p>
          </div>
        )}
        {ride.cancellation_reason && (
          <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            Причина отмены: {ride.cancellation_reason}
          </div>
        )}
      </section>

      <section className="mt-4 rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          {ride.club ? (
            <ClubAvatar club={ride.club} />
          ) : (
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-app-accent text-app-accentText">
              <UserRound size={24} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
              {ride.organizer.type === "club" ? "Клуб" : "Райдер"}
            </p>
            <h2 className="truncate text-lg font-black">{ride.organizer.name}</h2>
            <p className="line-clamp-2 text-sm text-app-muted">{ride.organizer.description}</p>
          </div>
        </div>
        {ride.club && (
          <Link
            href={`/clubs/${ride.club.slug}`}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-app-stroke bg-white text-sm font-bold"
          >
            Открыть клуб
            <ExternalLink size={16} />
          </Link>
        )}
      </section>

      <section className="mt-4 rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <h2 className="text-base font-black">Кто едет</h2>
        <div className="mt-3 space-y-2">
          {ride.participants.length > 0 ? (
            ride.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="text-sm font-semibold">{participant.user.first_name}</span>
                <span className="text-xs font-bold text-app-muted">
                  {registrationLabels[participant.status]}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-app-muted">Пока никто не записался. Можно быть первым.</p>
          )}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {ride.route_url && (
          <a
            href={ride.route_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-app-card text-sm font-bold"
          >
            <Route size={17} />
            Открыть маршрут
          </a>
        )}
        {ride.route && !ride.route_url && (
          <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-app-card px-3 text-center text-sm font-bold">
            <Route size={17} />
            Маршрут сохранен в Катнуть · {ride.route.distance_km ?? ride.distance_km} км
          </div>
        )}
        {ride.telegram_chat_url && (
          <a
            href={ride.telegram_chat_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-app-stroke bg-app-card text-sm font-bold"
          >
            <MessageCircle size={17} />
            Открыть чат
          </a>
        )}
        <ShareRideButton ride={ride} />
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-app-stroke bg-app-card p-3 shadow-soft">
      <div className="text-app-accent">{icon}</div>
      <p className="mt-2 text-xs font-semibold text-app-muted">{label}</p>
      <p className="mt-1 text-sm font-black leading-tight">{value}</p>
    </div>
  );
}
