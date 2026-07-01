"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { clubRoleLabels } from "@/lib/labels";
import type { ClubMembership, ClubRole, User } from "@/lib/types";

export function ClubMembersManager({
  clubId,
  members,
  users
}: {
  clubId: string;
  members: Array<ClubMembership & { user: User }>;
  users: User[];
}) {
  const [message, setMessage] = useState("");

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const actorId = window.localStorage.getItem("katnut_user_id") ?? "00000000-0000-4000-8000-000000000001";
    const response = await fetch(`/api/clubs/${clubId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor_user_id: actorId,
        user_id: String(form.get("user_id")),
        role: String(form.get("role"))
      })
    });
    setMessage(response.ok ? "Роль сохранена. Обновите страницу, чтобы увидеть изменения." : "Не удалось сохранить роль");
  }

  async function remove(memberId: string) {
    const actorId = window.localStorage.getItem("katnut_user_id") ?? "00000000-0000-4000-8000-000000000001";
    const response = await fetch(`/api/clubs/${clubId}/members/${memberId}`, {
      method: "DELETE",
      headers: { "x-demo-user-id": actorId }
    });
    setMessage(response.ok ? "Роль удалена. Обновите страницу." : "Не удалось удалить роль");
  }

  const roleOptions: ClubRole[] = ["club_admin", "club_organizer", "club_member", "banned"];

  return (
    <section className="rounded-lg border border-app-stroke bg-app-card p-4 shadow-soft">
      <h2 className="text-base font-black">Участники и роли</h2>
      <div className="mt-3 space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{member.user.first_name}</p>
              <p className="text-xs font-semibold text-app-muted">{clubRoleLabels[member.role]}</p>
            </div>
            <button type="button" onClick={() => remove(member.id)} title="Удалить роль" className="grid h-9 w-9 place-items-center rounded-lg bg-white text-rose-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addMember} className="mt-4 grid grid-cols-1 gap-3">
        <select name="user_id" className="h-11 rounded-lg border border-app-stroke bg-white px-3 text-sm">
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} @{user.username ?? user.telegram_id ?? "demo"}
            </option>
          ))}
        </select>
        <select name="role" className="h-11 rounded-lg border border-app-stroke bg-white px-3 text-sm">
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {clubRoleLabels[role]}
            </option>
          ))}
        </select>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-app-accent text-sm font-bold text-app-accentText">
          <Plus size={16} />
          Сохранить роль
        </button>
      </form>
      {message && <p className="mt-2 text-sm font-semibold text-app-muted">{message}</p>}
    </section>
  );
}
