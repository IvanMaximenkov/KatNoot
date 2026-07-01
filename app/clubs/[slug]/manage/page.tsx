import { notFound } from "next/navigation";
import { ClubManagePanel } from "@/components/ClubManagePanel";
import { demoUser } from "@/lib/demo-data";
import { getClubPageData, listUsers } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function ClubManagePage({ params }: { params: { slug: string } }) {
  const [data, users] = await Promise.all([getClubPageData(params.slug, demoUser.id), listUsers()]);
  if (!data) {
    notFound();
  }

  if (!data.canManage) {
    return (
      <div className="px-4 pt-4">
        <section className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
          <h1 className="text-2xl font-black">Нет доступа</h1>
          <p className="mt-2 text-sm text-app-muted">
            Управлять клубом могут owner/admin клуба или super_admin.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
          Управление клубом
        </p>
        <h1 className="mt-1 text-3xl font-black">{data.club.name}</h1>
      </header>
      <ClubManagePanel
        club={data.club}
        members={data.members}
        users={users}
        rides={[...data.upcomingRides, ...data.pastRides]}
      />
    </div>
  );
}
