import { ProfileClient } from "@/components/ProfileClient";
import { getProfileData } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const data = await getProfileData();

  return (
    <div className="px-4 pt-4">
      <ProfileClient
        user={data.user}
        registeredRides={data.registeredRides}
        createdRides={data.createdRides}
      />
    </div>
  );
}
