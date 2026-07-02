import { MapView } from "@/components/MapView";
import { listCyclingInfrastructure, listMapPoints, listRides } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [rides, mapPoints, infrastructure] = await Promise.all([
    listRides(),
    listMapPoints(),
    listCyclingInfrastructure()
  ]);
  return <MapView rides={rides} mapPoints={mapPoints} infrastructure={infrastructure} />;
}
