import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { InboxClient } from "./_inbox-client";

interface Props {
  params: { locale: string };
}

export default async function MessagesPage({ params }: Props) {
  const locale = params.locale === "en" ? "en" : "ar";
  const user = await getServerUser();

  if (!user) {
    redirect(
      `/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/account/messages`)}`,
    );
  }

  return <InboxClient />;
}
