import { MapView } from "@/components/MapView";
import { listMapPoints, listRides } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [rides, mapPoints] = await Promise.all([listRides(), listMapPoints()]);
  return <MapView rides={rides} mapPoints={mapPoints} />;
}
