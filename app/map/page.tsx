import { MapView } from "@/components/MapView";
import { listRides } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const rides = await listRides();
  return <MapView rides={rides} />;
}
