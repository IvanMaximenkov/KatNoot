"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { ClubMembersManager } from "@/components/ClubMembersManager";
import type { Club, ClubMembership, RideWithClub, User } from "@/lib/types";

export function ClubManagePanel({
  club,
  members,
  users,
  rides
}: {
  club: Club;
  members: Array<ClubMembership & { user: User }>;
  users: User[];
  rides: RideWithClub[];
}) {
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const actorId = window.localStorage.getItem("katnut_user_id") ?? "00000000-0000-4000-8000-000000000001";
    const tags = String(form.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const response = await fetch(`/api/clubs/${club.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor_user_id: actorId,
        name: String(form.get("name") || ""),
        description: String(form.get("description") || ""),
        telegram_url: String(form.get("telegram_url") || "") || null,
        tags,
        status: String(form.get("status"))
      })
    });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Клуб сохранен." : result.error ?? "Не удалось сохранить клуб");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <h2 className="text-base font-black">Страница клуба</h2>
        <label className="mt-4 block text-sm font-bold" htmlFor="name">
          Название
          <input id="name" name="name" defaultValue={club.name} required className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3" />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="description">
          Описание
          <textarea id="description" name="description" rows={5} defaultValue={club.description} required className="mt-2 w-full rounded-lg border border-app-stroke bg-white p-3" />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="telegram_url">
          Telegram URL
          <input id="telegram_url" name="telegram_url" type="url" defaultValue={club.telegram_url ?? ""} className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3" />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="tags">
          Теги через запятую
          <input id="tags" name="tags" defaultValue={club.tags.join(", ")} className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3" />
        </label>
        <label className="mt-4 block text-sm font-bold" htmlFor="status">
          Статус
          <select id="status" name="status" defaultValue={club.status ?? "active"} className="mt-2 h-12 w-full rounded-lg border border-app-stroke bg-white px-3">
            <option value="active">Активен</option>
            <option value="suspended">Заморожен</option>
            <option value="archived">Архив</option>
          </select>
        </label>
        <button type="submit" className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-app-accent text-sm font-bold text-app-accentText">
          <Save size={16} />
          Сохранить клуб
        </button>
        {message && <p className="mt-2 text-sm font-semibold text-app-muted">{message}</p>}
      </form>

      <ClubMembersManager clubId={club.id} members={members} users={users} />

      <section className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-black">Заезды клуба</h2>
          <Link href={`/create?club_id=${club.id}`} className="rounded-lg bg-app-accent px-3 py-2 text-xs font-bold text-app-accentText">
            Создать
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {rides.length > 0 ? (
            rides.map((ride) => (
              <Link key={ride.id} href={`/rides/${ride.id}/edit`} className="block rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold">
                {ride.title}
              </Link>
            ))
          ) : (
            <p className="text-sm text-app-muted">У клуба пока нет заездов.</p>
          )}
        </div>
      </section>
    </div>
  );
}
