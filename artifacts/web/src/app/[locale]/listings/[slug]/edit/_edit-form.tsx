"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useListCategories, CreateListingBodyCurrency } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, MapPin, Check, ChevronsUpDown, AlertTriangle } from "lucide-react";

const CURRENCIES = [
  { value: CreateListingBodyCurrency.SYP, label: "ل.س", sublabel: "SYP" },
  { value: CreateListingBodyCurrency.USD, label: "$", sublabel: "USD" },
];

const editSchema = z.object({
  categoryId: z.string().min(1, "يرجى اختيار التصنيف"),
  titleAr: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  titleEn: z.string().optional(),
  descriptionAr: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  descriptionEn: z.string().optional(),
  priceCents: z.coerce.number().min(0).optional(),
  currency: z.nativeEnum(CreateListingBodyCurrency).default(CreateListingBodyCurrency.SYP),
  isFree: z.boolean().default(false),
  isNegotiable: z.boolean().default(false),
  city: z.string().min(2, "يرجى اختيار المدينة"),
  district: z.string().optional(),
});
type EditValues = z.infer<typeof editSchema>;

type Listing = {
  id: string;
  slug: string;
  categoryId: string;
  titleAr: string;
  titleEn?: string | null;
  descriptionAr: string;
  descriptionEn?: string | null;
  priceCents?: number | null;
  currency: string;
  isFree: boolean;
  isNegotiable: boolean;
  city: string;
  district?: string | null;
  status: string;
};

export function EditListingForm({ listing }: { listing: Listing }) {
  const { t, locale, path } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [cityOpen, setCityOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cities, setCities] = useState<Array<{ ar: string; en: string }>>([]);

  const { data: categoriesData } = useListCategories();
  const categoriesList = categoriesData?.data ?? [];

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((json: { data?: { cities?: Array<{ ar: string; en: string }> } }) => {
        if (json.data?.cities?.length) setCities(json.data.cities);
      })
      .catch(() => {});
  }, []);

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      categoryId: listing.categoryId,
      titleAr: listing.titleAr,
      titleEn: listing.titleEn ?? "",
      descriptionAr: listing.descriptionAr,
      descriptionEn: listing.descriptionEn ?? "",
      priceCents: listing.priceCents ?? undefined,
      currency: (listing.currency as CreateListingBodyCurrency) ?? CreateListingBodyCurrency.SYP,
      isFree: listing.isFree,
      isNegotiable: listing.isNegotiable,
      city: listing.city,
      district: listing.district ?? "",
    },
  });

  const isFree = form.watch("isFree");

  const onSubmit = async (values: EditValues) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        toast({ variant: "destructive", title: err.error ?? (locale === "ar" ? "حدث خطأ" : "Error") });
        return;
      }

      toast({
        title: locale === "ar" ? "تم حفظ التعديلات" : "Listing updated",
        description:
          locale === "ar"
            ? "سيخضع إعلانك للمراجعة مجدداً قبل النشر."
            : "Your listing will be reviewed again before publishing.",
      });
      router.push(path(`/listings/${listing.slug}`));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl py-10">
      {/* Pending notice */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-4 mb-6">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          {locale === "ar"
            ? "بعد حفظ التعديلات، سيعود الإعلان لقائمة المراجعة قبل إعادة نشره."
            : "After saving, your listing will be re-reviewed before going live again."}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* ─── Basics ─── */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-secondary/40 border-b border-border/30 pb-4">
              <CardTitle className="text-lg">{locale === "ar" ? "تفاصيل الإعلان" : "Listing details"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Category */}
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    {t("post.category")} <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {categoriesList.map((cat) => {
                        const label = locale === "ar" ? cat.nameAr : cat.nameEn || cat.nameAr;
                        const isSelected = field.value === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { field.onChange(cat.id); field.onBlur(); }}
                            className={cn(
                              "px-3 py-1.5 rounded-full border text-sm transition-colors",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border/60 hover:border-primary/60",
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="titleAr" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">{t("post.title_ar")} <span className="text-rose-500">*</span></FormLabel>
                  <FormControl><Input dir="rtl" {...field} /></FormControl>
                  <FormMessage className="text-rose-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="descriptionAr" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">{t("post.desc_ar")} <span className="text-rose-500">*</span></FormLabel>
                  <FormControl><Textarea dir="rtl" rows={4} className="resize-none" {...field} /></FormControl>
                  <FormMessage className="text-rose-500" />
                </FormItem>
              )} />

              <FormField control={form.control} name="titleEn" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">{t("post.title_en")}</FormLabel>
                  <FormControl><Input dir="ltr" {...field} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="descriptionEn" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">{t("post.desc_en")}</FormLabel>
                  <FormControl><Textarea dir="ltr" rows={3} className="resize-none" {...field} /></FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ─── Price & Location ─── */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-secondary/40 border-b border-border/30 pb-4">
              <CardTitle className="text-lg">{t("post.section.price_location")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <FormField control={form.control} name="isFree" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4">
                  <FormLabel className="text-base font-medium cursor-pointer">{t("post.is_free")}</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              {!isFree && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="priceCents" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">{t("post.price")}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage className="text-rose-500" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">{t("post.currency")}</FormLabel>
                      <FormControl>
                        <div className="flex rounded-lg border border-border overflow-hidden h-10">
                          {CURRENCIES.map((c) => {
                            const isActive = field.value === c.value;
                            return (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => field.onChange(c.value)}
                                className={cn(
                                  "flex-1 flex flex-col items-center justify-center text-xs font-semibold transition-colors leading-none gap-0.5",
                                  isActive ? "bg-amber-500 text-white" : "bg-background text-muted-foreground hover:bg-secondary",
                                )}
                              >
                                <span className="text-sm">{c.label}</span>
                                <span className="opacity-75 text-[10px]">{c.sublabel}</span>
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              <FormField control={form.control} name="isNegotiable" render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/10 px-4 py-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">{t("post.is_negotiable")}</FormLabel>
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="city" render={({ field }) => {
                  const selected = cities.find((c) => c.ar === field.value);
                  const displayLabel = selected
                    ? locale === "ar" ? selected.ar : `${selected.en} — ${selected.ar}`
                    : t("post.city.placeholder");
                  return (
                    <FormItem>
                      <FormLabel className="font-semibold">{t("post.city")} <span className="text-rose-500">*</span></FormLabel>
                      <Popover open={cityOpen} onOpenChange={setCityOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={cityOpen}
                              className={cn("w-full justify-between font-normal h-10", !field.value && "text-muted-foreground")}
                            >
                              <span className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {displayLabel}
                              </span>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder={locale === "ar" ? "ابحث عن مدينة..." : "Search city..."} />
                            <CommandList>
                              <CommandEmpty>{locale === "ar" ? "لا توجد نتائج" : "No cities found."}</CommandEmpty>
                              <CommandGroup>
                                {cities.map((c) => (
                                  <CommandItem
                                    key={c.ar}
                                    value={`${c.ar} ${c.en}`}
                                    onSelect={() => { field.onChange(c.ar); field.onBlur(); setCityOpen(false); }}
                                  >
                                    <Check className={cn("me-2 h-4 w-4", field.value === c.ar ? "opacity-100" : "opacity-0")} />
                                    {locale === "ar" ? c.ar : `${c.en} — ${c.ar}`}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-rose-500" />
                    </FormItem>
                  );
                }} />

                <FormField control={form.control} name="district" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">{t("post.district")}</FormLabel>
                    <FormControl>
                      <Input placeholder={locale === "ar" ? "مثال: المزة" : "e.g. Mezzeh"} {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* ─── Actions ─── */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => router.back()}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="lg"
              className="min-w-[180px] rounded-xl gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{locale === "ar" ? "جاري الحفظ..." : "Saving..."}</>
              ) : (
                locale === "ar" ? "حفظ التعديلات" : "Save changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
