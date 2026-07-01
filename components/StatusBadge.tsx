import { Badge } from "@/components/Badge";
import { clubApplicationStatusLabels, clubStatusLabels, rideStatusLabels } from "@/lib/labels";
import type { ClubApplicationStatus, ClubStatus, RideStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: RideStatus | ClubStatus | ClubApplicationStatus }) {
  const label =
    status in rideStatusLabels
      ? rideStatusLabels[status as RideStatus]
      : status in clubStatusLabels
        ? clubStatusLabels[status as ClubStatus]
        : clubApplicationStatusLabels[status as ClubApplicationStatus];
  const tone: "green" | "red" | "gray" =
    status === "cancelled" || status === "rejected" || status === "suspended"
      ? "red"
      : status === "active" || status === "published" || status === "approved"
        ? "green"
        : "gray";
  return <Badge tone={tone}>{label}</Badge>;
}
