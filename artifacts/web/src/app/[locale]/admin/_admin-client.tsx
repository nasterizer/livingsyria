"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  RefreshCw,
  Check,
  X,
  ShieldAlert,
  Settings,
  Newspaper,
  LayoutList,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";

type Tab = "listings" | "settings" | "news";

type Listing = {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  status: string;
  city: string;
  createdAt: string;
  moderationScore?: number | null;
  moderationReason?: string | null;
};

type Setting = {
  value: unknown;
  label: string;
  description: string | null;
  group: string;
};

type NewsItem = {
  id: string;
  titleAr: string;
  sourceName: string;
  status: string;
  publishedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  DRAFT: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

// ─── Listings Tab ─────────────────────────────────────────────────────────────

function ListingsTab() {
  const { locale } = useI18n();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const qs = statusFilter ? `?status=${statusFilter}&limit=50` : "?limit=50";
      const res = await fetch(`/api/admin/listings${qs}`);
      const json = await res.json();
      setListings(json.data ?? []);
      setTotal(json.meta?.total ?? 0);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (id: string) => {
    await fetch(`/api/admin/listings/${id}/approve`, { method: "POST" });
    toast({ title: locale === "ar" ? "تمت الموافقة" : "Approved" });
    void load();
  };

  const reject = async (id: string) => {
    await fetch(`/api/admin/listings/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason || undefined }),
    });
    setRejectingId(null);
    setRejectReason("");
    toast({ title: locale === "ar" ? "تم الرفض" : "Rejected" });
    void load();
  };

  const STATUS_TABS = [
    { value: "PENDING_REVIEW", label: locale === "ar" ? "بانتظار المراجعة" : "Pending" },
    { value: "ACTIVE", label: locale === "ar" ? "نشط" : "Active" },
    { value: "REJECTED", label: locale === "ar" ? "مرفوض" : "Rejected" },
    { value: "", label: locale === "ar" ? "الكل" : "All" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                statusFilter === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {total} {locale === "ar" ? "إعلان" : "listings"}
          <Button variant="ghost" size="icon" onClick={load} className="h-7 w-7">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {locale === "ar" ? "لا توجد إعلانات" : "No listings"}
        </div>
      ) : (
        <div className="space-y-2">
          {listings.map((listing) => (
            <Card key={listing.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                          STATUS_COLORS[listing.status] ?? STATUS_COLORS.DRAFT,
                        )}
                      >
                        {listing.status}
                      </span>
                      {listing.moderationScore !== null &&
                        listing.moderationScore !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            score: {(listing.moderationScore * 100).toFixed(0)}%
                          </span>
                        )}
                    </div>
                    <p className="font-medium text-foreground line-clamp-1">
                      {listing.titleAr}
                    </p>
                    {listing.titleEn && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {listing.titleEn}
                      </p>
                    )}
                    {listing.moderationReason && (
                      <p className="text-xs text-red-600 mt-1 line-clamp-1">
                        {listing.moderationReason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {listing.city} · {formatRelative(listing.createdAt, locale as "ar" | "en")}
                    </p>
                  </div>

                  {rejectingId === listing.id ? (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <Input
                        placeholder={locale === "ar" ? "سبب الرفض (اختياري)" : "Reason (optional)"}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs flex-1"
                          onClick={() => reject(listing.id)}
                        >
                          <X className="h-3 w-3 me-1" />
                          {locale === "ar" ? "رفض" : "Confirm"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setRejectingId(null)}
                        >
                          {locale === "ar" ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => approve(listing.id)}
                        disabled={listing.status === "ACTIVE"}
                      >
                        <Check className="h-3 w-3" />
                        {locale === "ar" ? "قبول" : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => setRejectingId(listing.id)}
                        disabled={listing.status === "REJECTED"}
                      >
                        <X className="h-3 w-3" />
                        {locale === "ar" ? "رفض" : "Reject"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

type CityRow = { ar: string; en: string };
type FeedRow = { name: string; url: string; language: string };

function CitiesEditor({
  settingKey,
  initial,
  onSaved,
}: {
  settingKey: string;
  initial: CityRow[];
  onSaved: () => void;
}) {
  const { locale } = useI18n();
  const { toast } = useToast();
  const [rows, setRows] = useState<CityRow[]>(initial);
  const [isSaving, setIsSaving] = useState(false);

  const update = (i: number, field: "ar" | "en", val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const add = () => setRows((r) => [...r, { ar: "", en: "" }]);

  const save = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/${settingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: rows }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast({ variant: "destructive", title: err.error ?? "Error" });
        return;
      }
      toast({ title: locale === "ar" ? "تم الحفظ" : "Saved" });
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5 text-xs font-medium text-muted-foreground mb-1 px-1">
        <span>{locale === "ar" ? "الاسم بالعربية" : "Arabic name"}</span>
        <span>{locale === "ar" ? "الاسم بالإنجليزية" : "English name"}</span>
        <span />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1.5 items-center">
          <Input
            value={row.ar}
            dir="rtl"
            placeholder="مثال: دمشق"
            className="h-8 text-sm"
            onChange={(e) => update(i, "ar", e.target.value)}
          />
          <Input
            value={row.en}
            placeholder="e.g. Damascus"
            className="h-8 text-sm"
            onChange={(e) => update(i, "en", e.target.value)}
          />
          <button
            onClick={() => remove(i)}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={add}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {locale === "ar" ? "إضافة مدينة" : "Add city"}
        </button>
        <Button size="sm" onClick={save} disabled={isSaving} className="h-8">
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : locale === "ar" ? "حفظ" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function FeedsEditor({
  settingKey,
  initial,
  onSaved,
}: {
  settingKey: string;
  initial: FeedRow[];
  onSaved: () => void;
}) {
  const { locale } = useI18n();
  const { toast } = useToast();
  const [rows, setRows] = useState<FeedRow[]>(initial);
  const [isSaving, setIsSaving] = useState(false);

  const update = (i: number, field: keyof FeedRow, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const add = () => setRows((r) => [...r, { name: "", url: "", language: "ar" }]);

  const save = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/${settingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: rows }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast({ variant: "destructive", title: err.error ?? "Error" });
        return;
      }
      toast({ title: locale === "ar" ? "تم الحفظ" : "Saved" });
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/50 bg-secondary/30 relative">
          <button
            onClick={() => remove(i)}
            className="absolute top-2 end-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 items-center pr-6">
            <span className="text-xs text-muted-foreground">{locale === "ar" ? "الاسم" : "Name"}</span>
            <Input
              value={row.name}
              placeholder="BBC Arabic"
              className="h-7 text-sm"
              onChange={(e) => update(i, "name", e.target.value)}
            />
            <span className="text-xs text-muted-foreground">URL</span>
            <Input
              value={row.url}
              placeholder="https://…/rss.xml"
              className="h-7 text-sm font-mono"
              onChange={(e) => update(i, "url", e.target.value)}
            />
            <span className="text-xs text-muted-foreground">{locale === "ar" ? "اللغة" : "Lang"}</span>
            <div className="flex gap-2">
              {(["ar", "en"] as const).map((lang) => (
                <label key={lang} className="flex items-center gap-1 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={`feed-lang-${i}`}
                    value={lang}
                    checked={row.language === lang}
                    onChange={() => update(i, "language", lang)}
                    className="accent-primary"
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          onClick={add}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {locale === "ar" ? "إضافة مصدر" : "Add source"}
        </button>
        <Button size="sm" onClick={save} disabled={isSaving} className="h-8">
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : locale === "ar" ? "حفظ" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function SettingRow({
  settingKey,
  setting,
  onSaved,
}: {
  settingKey: string;
  setting: Setting;
  onSaved: () => void;
}) {
  const { locale } = useI18n();
  const { toast } = useToast();
  const [editValue, setEditValue] = useState<string>(() =>
    typeof setting.value === "string"
      ? setting.value
      : JSON.stringify(setting.value, null, 2),
  );
  const [boolValue, setBoolValue] = useState(
    typeof setting.value === "boolean" ? setting.value : false,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const valueType = Array.isArray(setting.value)
    ? "array"
    : typeof setting.value;

  const isCities =
    settingKey === "listings.cities" &&
    Array.isArray(setting.value) &&
    (setting.value as unknown[]).every(
      (v) => typeof v === "object" && v !== null && "ar" in v && "en" in v,
    );

  const isFeeds =
    settingKey === "news.feeds" &&
    Array.isArray(setting.value) &&
    (setting.value as unknown[]).every(
      (v) => typeof v === "object" && v !== null && "url" in v,
    );

  const save = async () => {
    setIsSaving(true);
    try {
      let payload: unknown;
      if (valueType === "boolean") {
        payload = boolValue;
      } else if (valueType === "number") {
        const n = Number(editValue);
        if (isNaN(n)) {
          toast({ variant: "destructive", title: "Invalid number" });
          return;
        }
        payload = n;
      } else if (valueType === "array" || valueType === "object") {
        try {
          payload = JSON.parse(editValue);
        } catch {
          toast({ variant: "destructive", title: "Invalid JSON" });
          return;
        }
      } else {
        payload = editValue;
      }

      const res = await fetch(`/api/admin/settings/${settingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: payload }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ variant: "destructive", title: err.error ?? "Error" });
        return;
      }

      setIsDirty(false);
      toast({ title: locale === "ar" ? "تم الحفظ" : "Saved" });
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-4 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="font-medium text-sm text-foreground">
          {setting.label}
        </span>
        <code className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
          {settingKey}
        </code>
      </div>
      {setting.description && (
        <p className="text-xs text-muted-foreground mb-2">
          {setting.description}
        </p>
      )}

      {isCities ? (
        <CitiesEditor
          settingKey={settingKey}
          initial={setting.value as CityRow[]}
          onSaved={onSaved}
        />
      ) : isFeeds ? (
        <FeedsEditor
          settingKey={settingKey}
          initial={setting.value as FeedRow[]}
          onSaved={onSaved}
        />
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {valueType === "boolean" ? (
              <Switch
                checked={boolValue}
                onCheckedChange={(v) => {
                  setBoolValue(v);
                  setIsDirty(true);
                  fetch(`/api/admin/settings/${settingKey}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ value: v }),
                  }).catch(() => {});
                }}
              />
            ) : valueType === "number" ? (
              <Input
                type="number"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  setIsDirty(true);
                }}
                className="h-8 text-sm w-40"
              />
            ) : valueType === "string" &&
              (setting.value as string).length < 100 ? (
              <Input
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  setIsDirty(true);
                }}
                className="h-8 text-sm"
              />
            ) : (
              <Textarea
                value={editValue}
                rows={valueType === "string" ? 4 : 6}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  setIsDirty(true);
                }}
                className="text-sm font-mono resize-y"
              />
            )}
          </div>

          {valueType !== "boolean" && (
            <Button
              size="sm"
              onClick={save}
              disabled={!isDirty || isSaving}
              className="mt-0 shrink-0 h-8"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>{locale === "ar" ? "حفظ" : "Save"}</>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { locale } = useI18n();
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      setSettings(json.data ?? {});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Group settings by their group field
  const grouped = Object.entries(settings).reduce<
    Record<string, [string, Setting][]>
  >((acc, [key, setting]) => {
    const g = setting.group;
    if (!acc[g]) acc[g] = [];
    acc[g].push([key, setting]);
    return acc;
  }, {});

  return isLoading ? (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ) : (
    <div className="space-y-6">
      {Object.entries(grouped).map(([group, entries]) => (
        <Card key={group} className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {group}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-2">
            {entries.map(([key, setting]) => (
              <SettingRow
                key={key}
                settingKey={key}
                setting={setting}
                onSaved={load}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── News Tab ─────────────────────────────────────────────────────────────────

function NewsTab() {
  const { locale } = useI18n();
  const { toast } = useToast();
  const [stats, setStats] = useState<{
    total: number;
    recent: NewsItem[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      const json = await res.json();
      setStats(json.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const triggerIngest = async () => {
    setIsIngesting(true);
    await fetch("/api/admin/news/ingest", { method: "POST" });
    toast({
      title: locale === "ar" ? "بدأ الاستيراد" : "Ingestion started",
      description:
        locale === "ar"
          ? "سيتم معالجة المقالات في الخلفية"
          : "Articles are being processed in the background",
    });
    setTimeout(() => {
      setIsIngesting(false);
      void load();
    }, 5000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {stats && (
            <p className="text-muted-foreground text-sm">
              {locale === "ar" ? "إجمالي المقالات:" : "Total articles:"}{" "}
              <span className="font-semibold text-foreground">{stats.total}</span>
            </p>
          )}
        </div>
        <Button onClick={triggerIngest} disabled={isIngesting} className="gap-2">
          {isIngesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {locale === "ar" ? "استيراد الأخبار" : "Trigger ingestion"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {(stats?.recent ?? []).map((article) => (
            <Card key={article.id} className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm line-clamp-2">
                      {article.titleAr}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {article.sourceName} ·{" "}
                      {formatRelative(article.publishedAt, locale as "ar" | "en")}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 text-xs",
                      article.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700 border-0"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {article.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

export function AdminDashboard() {
  const { locale } = useI18n();
  const [tab, setTab] = useState<Tab>("listings");

  const TABS: { id: Tab; label: { ar: string; en: string }; icon: React.ReactNode }[] = [
    {
      id: "listings",
      label: { ar: "الإعلانات", en: "Listings" },
      icon: <LayoutList className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: { ar: "الإعدادات", en: "Settings" },
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "news",
      label: { ar: "الأخبار", en: "News" },
      icon: <Newspaper className="h-4 w-4" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "ar" ? "لوحة الإدارة" : "Admin Panel"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === "ar" ? "LivingSyria — إدارة المحتوى" : "LivingSyria — Content management"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {icon}
            {locale === "ar" ? label.ar : label.en}
          </button>
        ))}
      </div>

      {tab === "listings" && <ListingsTab />}
      {tab === "settings" && <SettingsTab />}
      {tab === "news" && <NewsTab />}
    </div>
  );
}
