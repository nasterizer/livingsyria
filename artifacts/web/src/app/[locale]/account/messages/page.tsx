import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { apiFetch } from "@/lib/api";
import { InboxClient } from "./_inbox-client";
import { MessageCircleOff } from "lucide-react";

interface Props {
  params: { locale: string };
}

async function getMessagingEnabled(): Promise<boolean> {
  try {
    const res = await apiFetch<{ data: { messagingEnabled: boolean } }>("/api/settings/public");
    return res.data.messagingEnabled ?? true;
  } catch {
    return true;
  }
}

export default async function MessagesPage({ params }: Props) {
  const locale = params.locale === "en" ? "en" : "ar";
  const [user, messagingEnabled] = await Promise.all([
    getServerUser(),
    getMessagingEnabled(),
  ]);

  if (!user) {
    redirect(
      `/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/account/messages`)}`,
    );
  }

  if (!messagingEnabled) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <MessageCircleOff className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">
          {locale === "ar" ? "خاصية المراسلة معطّلة" : "Messaging is disabled"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "ar"
            ? "تم تعطيل المراسلة مؤقتًا من قِبَل إدارة المنصة."
            : "Messaging has been temporarily disabled by the platform administrators."}
        </p>
      </div>
    );
  }

  return <InboxClient />;
}
