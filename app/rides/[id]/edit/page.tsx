import { notFound } from "next/navigation";
import { RideEditForm } from "@/components/RideEditForm";
import { canEditRide, getRideDetail } from "@/lib/db/repository";
import { demoUser } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function RideEditPage({ params }: { params: { id: string } }) {
  const ride = await getRideDetail(params.id, true);
  if (!ride) {
    notFound();
  }

  const allowed = await canEditRide(demoUser.id, ride.id);
  if (!allowed) {
    return (
      <div className="px-4 pt-4">
        <section className="rounded-lg border border-app-stroke bg-app-card p-5 shadow-soft">
          <h1 className="text-2xl font-black">Нет доступа</h1>
          <p className="mt-2 text-sm text-app-muted">
            Редактировать заезд может организатор, админ клуба или super_admin.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-app-accent">
          Управление заездом
        </p>
        <h1 className="mt-1 text-3xl font-black">Редактировать</h1>
      </header>
      <RideEditForm ride={ride} />
    </div>
  );
}
