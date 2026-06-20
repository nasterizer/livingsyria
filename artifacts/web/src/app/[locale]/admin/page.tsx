import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { AdminDashboard } from "./_admin-client";

interface Props {
  params: { locale: string };
}

function isAdminUser(userId: string): boolean {
  const admins = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return admins.includes(userId);
}

export default async function AdminPage({ params }: Props) {
  const locale = params.locale === "en" ? "en" : "ar";
  const user = await getServerUser();

  if (!user) {
    redirect(
      `/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/admin`)}`,
    );
  }

  if (!isAdminUser(user.id)) {
    redirect(`/${locale}`);
  }

  return <AdminDashboard />;
}
