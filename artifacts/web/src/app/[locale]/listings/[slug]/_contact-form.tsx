"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Loader2, Pencil, Check } from "lucide-react";
import Link from "next/link";

interface Props {
  listingId: string;
  listingOwnerId: string;
  currentUserId: string | null;
  listingSlug: string;
}

export function ContactSellerForm({
  listingId,
  listingOwnerId,
  currentUserId,
  listingSlug,
}: Props) {
  const { t, locale, path } = useI18n();
  const { login } = useAuth();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isOwner = currentUserId === listingOwnerId;

  // Owner sees an edit button instead of contact form
  if (isOwner) {
    return (
      <div className="space-y-2">
        <Button
          asChild
          variant="outline"
          className="w-full gap-2 rounded-full"
        >
          <Link href={path(`/listings/${listingSlug}/edit`)}>
            <Pencil className="h-4 w-4" />
            {locale === "ar" ? "تعديل الإعلان" : "Edit listing"}
          </Link>
        </Button>
      </div>
    );
  }

  // Not logged in
  if (!currentUserId) {
    return (
      <Button
        size="lg"
        className="w-full gap-2 rounded-full h-12"
        onClick={login}
      >
        <MessageCircle className="h-5 w-5" />
        {locale === "ar" ? "سجّل الدخول للتواصل" : "Sign in to contact seller"}
      </Button>
    );
  }

  // Message sent confirmation
  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {locale === "ar" ? "تم إرسال رسالتك" : "Message sent!"}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => router.push(path("/account/messages"))}
        >
          {locale === "ar" ? "عرض الرسائل" : "View inbox"}
        </Button>
      </div>
    );
  }

  const send = async () => {
    if (!body.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          toUserId: listingOwnerId,
          body: body.trim(),
        }),
      });
      if (res.ok) {
        setSent(true);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          locale === "ar"
            ? "اكتب رسالتك للبائع..."
            : "Write your message to the seller..."
        }
        rows={3}
        className="resize-none text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            void send();
          }
        }}
      />
      <Button
        size="lg"
        className="w-full gap-2 rounded-full h-12"
        onClick={send}
        disabled={!body.trim() || isSending}
      >
        {isSending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        {locale === "ar" ? "إرسال" : "Send message"}
      </Button>
    </div>
  );
}
