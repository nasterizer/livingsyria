"use client";

import { useState, useEffect, useCallback } from "react";
import { useMessagesSSE } from "@/hooks/useMessagesSSE";
import Link from "next/link";
import { useI18n, formatRelative } from "@/lib/i18n";
import { SmartImage } from "@/components/SmartImage";
import { imageUrl } from "@/lib/image";
import { MessageCircle, Send, Loader2, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Thread = {
  id: string;
  listing_id: string;
  listing_slug: string;
  title_ar: string;
  title_en?: string | null;
  primary_image_url?: string | null;
  partner_id: string;
  from_user_id: string;
  to_user_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
  unread_count: number;
};

type Message = {
  id: string;
  listingId: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export function InboxClient() {
  const { t, locale, path } = useI18n();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadInbox = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/messages/inbox");
      const json = await res.json();
      setThreads(json.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Wire SSE: auto-refresh inbox whenever a new message arrives server-side
  useMessagesSSE(() => void loadInbox());

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  const loadThread = useCallback(async (thread: Thread) => {
    setActiveThread(thread);
    setIsLoadingThread(true);
    try {
      const res = await fetch(
        `/api/messages/listing/${thread.listing_id}?withUserId=${thread.partner_id}`,
      );
      const json = await res.json();
      const msgs: Message[] = json.data ?? [];
      setMessages(msgs);
      // Infer our user ID from the first message
      if (msgs.length > 0) {
        const me = msgs.find((m) => m.fromUserId !== thread.partner_id);
        if (me) setCurrentUserId(me.fromUserId);
        else {
          const firstMsg = msgs[0];
          if (firstMsg) setCurrentUserId(firstMsg.toUserId);
        }
      }
    } finally {
      setIsLoadingThread(false);
    }
    // Refresh inbox to update unread counts
    void loadInbox();
  }, [loadInbox]);

  const sendReply = async () => {
    if (!activeThread || !reply.trim()) return;
    setIsSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: activeThread.listing_id,
          toUserId: activeThread.partner_id,
          body: reply.trim(),
        }),
      });
      setReply("");
      void loadThread(activeThread);
    } finally {
      setIsSending(false);
    }
  };

  const isRtl = locale === "ar";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-primary" />
          {locale === "ar" ? "صندوق الرسائل" : "Inbox"}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-20">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">
            {locale === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Thread list */}
          <div className="lg:col-span-1 overflow-y-auto border border-border/60 rounded-2xl divide-y divide-border/40">
            {threads.map((thread) => {
              const title =
                locale === "ar"
                  ? thread.title_ar
                  : thread.title_en || thread.title_ar;
              const isActive = activeThread?.id === thread.id;

              return (
                <button
                  key={thread.id}
                  onClick={() => loadThread(thread)}
                  className={cn(
                    "w-full text-start p-4 hover:bg-secondary/40 transition-colors",
                    isActive && "bg-primary/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border/40 shrink-0">
                      <SmartImage
                        src={imageUrl(thread.primary_image_url)}
                        alt={title}
                        seed={thread.listing_slug}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1 text-foreground">
                        {title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {thread.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelative(thread.created_at, locale as "ar" | "en")}
                      </p>
                    </div>
                    {thread.unread_count > 0 && (
                      <Badge className="shrink-0 bg-primary text-primary-foreground text-xs h-5 min-w-5 rounded-full flex items-center justify-center p-0">
                        {thread.unread_count}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Thread detail */}
          <div className="lg:col-span-2 flex flex-col border border-border/60 rounded-2xl overflow-hidden">
            {!activeThread ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                {locale === "ar"
                  ? "اختر محادثة من القائمة"
                  : "Select a conversation"}
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="p-4 border-b border-border/60 bg-secondary/20">
                  <Link
                    href={path(`/listings/${activeThread.listing_slug}`)}
                    className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                  >
                    {locale === "ar"
                      ? activeThread.title_ar
                      : activeThread.title_en || activeThread.title_ar}
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoadingThread ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.fromUserId === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            isMine
                              ? isRtl
                                ? "justify-start"
                                : "justify-end"
                              : isRtl
                              ? "justify-end"
                              : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                              isMine
                                ? "bg-primary text-primary-foreground rounded-ee-sm"
                                : "bg-secondary text-foreground rounded-es-sm",
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.body}
                            </p>
                            <p
                              className={cn(
                                "text-xs mt-1 opacity-70",
                                isMine ? "text-end" : "text-start",
                              )}
                            >
                              {formatRelative(msg.createdAt, locale as "ar" | "en")}
                              {isMine && msg.readAt && " ✓"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply box */}
                <div className="p-3 border-t border-border/60 bg-background">
                  <div className="flex gap-2">
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={
                        locale === "ar" ? "اكتب رسالتك..." : "Type a message..."
                      }
                      rows={2}
                      className="resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          void sendReply();
                        }
                      }}
                    />
                    <Button
                      onClick={sendReply}
                      disabled={!reply.trim() || isSending}
                      size="icon"
                      className="h-auto shrink-0"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
