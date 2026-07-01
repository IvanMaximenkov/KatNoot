import { AdminPanel } from "@/components/AdminPanel";
import { demoUser } from "@/lib/demo-data";
import {
  getAdminStats,
  listAdminClubs,
  listAdminRides,
  listAuditLogs,
  listClubApplications,
  listReports,
  listUsers
} from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (demoUser.global_role !== "super_admin") {
    return (
      <div className="px-4 pt-4">
        <section className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
          <h1 className="text-2xl font-black">Нет доступа</h1>
          <p className="mt-2 text-sm text-app-muted">Раздел доступен только super_admin.</p>
        </section>
      </div>
    );
  }

  const [stats, applications, clubs, rides, users, reports, auditLogs] = await Promise.all([
    getAdminStats(),
    listClubApplications(),
    listAdminClubs(),
    listAdminRides(),
    listUsers(),
    listReports(),
    listAuditLogs()
  ]);

  return (
    <div className="px-4 pt-4">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
          Super admin
        </p>
        <h1 className="mt-1 text-3xl font-black">Админка</h1>
        <p className="mt-2 text-sm text-app-muted">
          Модерация клубов, ролей, заездов, жалоб и аудит важных действий.
        </p>
      </header>
      <AdminPanel
        stats={stats}
        applications={applications}
        clubs={clubs}
        rides={rides}
        users={users}
        reports={reports}
        auditLogs={auditLogs}
        actorUserId={demoUser.id}
      />
    </div>
  );
}
