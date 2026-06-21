"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, formatRelative } from "@/lib/i18n";
import { useAuth } from "@workspace/replit-auth-web";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  titleAr: string;
  titleEn: string;
  listingId: string | null;
  readAt: string | null;
  createdAt: string;
};

type ApiResponse = {
  data: Notification[];
  meta: { unreadCount: number };
};

export function NotificationBell() {
  const { locale, path } = useI18n();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return;
      const json = (await res.json()) as ApiResponse;
      setNotifications(json.data ?? []);
      setUnreadCount(json.meta?.unreadCount ?? 0);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, fetchNotifications]);

  const markAllRead = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const markOneRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    }).catch(() => {});
  };

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-full bg-secondary text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={locale === "ar" ? "الإشعارات" : "Notifications"}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={locale === "ar" ? "start" : "end"}
        className="w-80 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <span className="font-semibold text-sm">
            {locale === "ar" ? "الإشعارات" : "Notifications"}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3" />
              )}
              {locale === "ar" ? "تعليم الكل كمقروء" : "Mark all read"}
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {locale === "ar" ? "لا توجد إشعارات" : "No notifications yet"}
            </div>
          ) : (
            notifications.map((n) => {
              const title = locale === "ar" ? n.titleAr : n.titleEn;
              const isUnread = !n.readAt;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/40 transition-colors",
                    isUnread && "bg-primary/5",
                  )}
                  onClick={() => {
                    if (isUnread) void markOneRead(n.id);
                  }}
                >
                  <div
                    className={cn(
                      "mt-0.5 h-2 w-2 rounded-full shrink-0",
                      n.type === "listing_approved"
                        ? "bg-emerald-500"
                        : "bg-red-400",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    {n.listingId ? (
                      <Link
                        href={path(`/account/listings`)}
                        className="text-xs text-foreground leading-relaxed hover:text-primary transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        {title}
                      </Link>
                    ) : (
                      <p className="text-xs text-foreground leading-relaxed">{title}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelative(n.createdAt, locale as "ar" | "en")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
