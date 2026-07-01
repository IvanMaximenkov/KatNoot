import type { GlobalRole, User } from "@/lib/types";

export function RoleGate({
  user,
  allow,
  children,
  fallback = null
}: {
  user: User;
  allow: GlobalRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return allow.includes(user.global_role ?? "rider") ? <>{children}</> : <>{fallback}</>;
}
