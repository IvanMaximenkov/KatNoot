import { MapView } from "@/components/MapView";
import { listMapPoints, listRides } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [rides, points] = await Promise.all([listRides(), listMapPoints()]);
  return <MapView rides={rides} points={points} />;
}
