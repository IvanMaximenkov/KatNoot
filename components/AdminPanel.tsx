"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Shield, X } from "lucide-react";
import {
  clubApplicationStatusLabels,
  clubStatusLabels,
  globalRoleLabels,
  rideStatusLabels
} from "@/lib/labels";
import type {
  AdminStats,
  AuditLog,
  ClubApplication,
  ClubWithStats,
  GlobalRole,
  ModerationReport,
  RideWithClub,
  User
} from "@/lib/types";

export function AdminPanel({
  stats,
  applications,
  clubs,
  rides,
  users,
  reports,
  auditLogs,
  actorUserId
}: {
  stats: AdminStats;
  applications: ClubApplication[];
  clubs: ClubWithStats[];
  rides: RideWithClub[];
  users: User[];
  reports: ModerationReport[];
  auditLogs: AuditLog[];
  actorUserId: string;
}) {
  const [message, setMessage] = useState("");

  async function post(path: string, body: Record<string, unknown>) {
    const response = await fetch(path, {
      method: path.includes("/role") || path.includes("/status") || path.includes("/reports/")
        ? "PATCH"
        : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actor_user_id: actorUserId, ...body })
    });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Готово. Обновите страницу, чтобы увидеть свежие данные." : result.error ?? "Не удалось выполнить действие");
  }

  return (
    <div className="space-y-5">
      {message && <p className="rounded-lg bg-slate-900 p-3 text-sm font-semibold text-white">{message}</p>}

      <section className="grid grid-cols-2 gap-2">
        <Stat label="Пользователи" value={stats.users} />
        <Stat label="Регистрации" value={stats.registrations} />
        <Stat label="Клубы active" value={stats.clubs.active} />
        <Stat label="Клубы pending" value={stats.clubs.pending} />
        <Stat label="Заезды published" value={stats.rides.published ?? stats.rides.active ?? 0} />
        <Stat label="Заезды cancelled" value={stats.rides.cancelled ?? 0} />
      </section>

      <AdminSection title="Заявки на клубы">
        {applications.map((application) => (
          <div key={application.id} className="rounded-lg border border-app-stroke bg-app-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black">{application.proposed_name}</p>
                <p className="text-xs font-semibold text-app-muted">
                  {clubApplicationStatusLabels[application.status]} · {application.telegram_url}
                </p>
              </div>
              <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-bold text-app-muted">
                {application.city}
              </span>
            </div>
            <p className="mt-2 text-sm text-app-muted">{application.description}</p>
            {application.status === "pending" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => post(`/api/admin/club-applications/${application.id}/approve`, { admin_comment: "Одобрено" })} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-bold text-white">
                  <Check size={16} />
                  Approve
                </button>
                <button type="button" onClick={() => post(`/api/admin/club-applications/${application.id}/reject`, { admin_comment: "Нужно больше подтверждений активности" })} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-600 text-sm font-bold text-white">
                  <X size={16} />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </AdminSection>

      <AdminSection title="Клубы">
        {clubs.map((club) => (
          <div key={club.id} className="rounded-lg border border-app-stroke bg-app-card p-3">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/clubs/${club.slug}`} className="text-sm font-black">{club.name}</Link>
              <span className="text-xs font-bold text-app-muted">{clubStatusLabels[club.status ?? "active"]}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => post(`/api/admin/clubs/${club.id}/status`, { status: club.status === "suspended" ? "active" : "suspended" })} className="h-10 rounded-lg border border-app-stroke bg-white text-sm font-bold">
                {club.status === "suspended" ? "Unsuspend" : "Suspend"}
              </button>
              <Link href={`/clubs/${club.slug}/manage`} className="inline-flex h-10 items-center justify-center rounded-lg bg-app-accent text-sm font-bold text-app-accentText">
                Управлять
              </Link>
            </div>
          </div>
        ))}
      </AdminSection>

      <AdminSection title="Пользователи">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border border-app-stroke bg-app-card p-3">
            <p className="text-sm font-black">{user.first_name} @{user.username ?? "demo"}</p>
            <select
              defaultValue={user.global_role ?? "rider"}
              onChange={(event) => post(`/api/admin/users/${user.id}/role`, { global_role: event.target.value as GlobalRole })}
              className="mt-2 h-10 w-full rounded-lg border border-app-stroke bg-white px-3 text-sm"
            >
              {(["rider", "verified_organizer", "super_admin"] as GlobalRole[]).map((role) => (
                <option key={role} value={role}>{globalRoleLabels[role]}</option>
              ))}
            </select>
          </div>
        ))}
      </AdminSection>

      <AdminSection title="Заезды">
        {rides.slice(0, 12).map((ride) => (
          <div key={ride.id} className="rounded-lg border border-app-stroke bg-app-card p-3">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/rides/${ride.id}`} className="text-sm font-black">{ride.title}</Link>
              <span className="text-xs font-bold text-app-muted">{rideStatusLabels[ride.status]}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href={`/rides/${ride.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-lg bg-app-accent text-sm font-bold text-app-accentText">
                Редактировать
              </Link>
              <button type="button" onClick={() => post(`/api/rides/${ride.id}/cancel`, { cancellation_reason: "Отменено модератором" })} className="h-10 rounded-lg border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700">
                Отменить
              </button>
            </div>
          </div>
        ))}
      </AdminSection>

      <AdminSection title="Жалобы">
        {reports.map((report) => (
          <div key={report.id} className="rounded-lg border border-app-stroke bg-app-card p-3">
            <p className="text-sm font-black">{report.target_type}: {report.target_id}</p>
            <p className="mt-1 text-sm text-app-muted">{report.reason}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => post(`/api/admin/reports/${report.id}`, { status: "resolved", admin_comment: "Обработано" })} className="h-10 rounded-lg bg-emerald-600 text-sm font-bold text-white">
                Resolve
              </button>
              <button type="button" onClick={() => post(`/api/admin/reports/${report.id}`, { status: "rejected", admin_comment: "Нет нарушения" })} className="h-10 rounded-lg border border-app-stroke bg-white text-sm font-bold">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </AdminSection>

      <AdminSection title="Audit log">
        {auditLogs.slice(0, 20).map((log) => (
          <div key={log.id} className="rounded-lg border border-app-stroke bg-app-card p-3">
            <p className="text-sm font-black">{log.action}</p>
            <p className="mt-1 text-xs font-semibold text-app-muted">{log.entity_type} · {log.entity_id}</p>
          </div>
        ))}
      </AdminSection>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-app-stroke bg-app-card p-3 shadow-soft">
      <p className="text-xs font-semibold text-app-muted">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Shield size={18} className="text-app-accent" />
        <h2 className="text-lg font-black">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
