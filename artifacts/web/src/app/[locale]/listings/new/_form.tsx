"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import {
  useCreateListing,
  useListCategories,
  CreateListingBodyCurrency,
} from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Store,
  ImagePlus,
  X,
  Loader2,
  Upload,
  Check,
  ChevronsUpDown,
  MapPin,
} from "lucide-react";

// MAX_PHOTOS and SYRIAN_CITIES are now loaded from DB settings via /api/settings/public

const CATEGORY_ICONS: Record<string, string> = {
  electronics: "📱",
  "إلكترونيات": "📱",
  cars: "🚗",
  سيارات: "🚗",
  vehicles: "🚗",
  "real estate": "🏠",
  عقارات: "🏠",
  property: "🏠",
  furniture: "🛋️",
  أثاث: "🛋️",
  clothing: "👗",
  ملابس: "👗",
  fashion: "👗",
  jobs: "💼",
  وظائف: "💼",
  work: "💼",
  services: "🔧",
  خدمات: "🔧",
  animals: "🐾",
  حيوانات: "🐾",
  pets: "🐾",
  food: "🍽️",
  طعام: "🍽️",
  books: "📚",
  كتب: "📚",
  sports: "⚽",
  رياضة: "⚽",
  tools: "🔨",
  أدوات: "🔨",
};

function getCategoryIcon(nameAr?: string, nameEn?: string, slug?: string): string {
  const candidates = [nameAr, nameEn, slug].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
        return icon;
      }
    }
  }
  return "📦";
}

const CURRENCIES = [
  { value: CreateListingBodyCurrency.SYP, label: "ل.س", sublabel: "SYP" },
  { value: CreateListingBodyCurrency.USD, label: "$", sublabel: "USD" },
];

const formSchema = z.object({
  categoryId: z.string().min(1, "يرجى اختيار التصنيف"),
  titleAr: z
    .string()
    .min(1, "هذا الحقل مطلوب")
    .min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  titleEn: z.string().optional(),
  descriptionAr: z
    .string()
    .min(1, "هذا الحقل مطلوب")
    .min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  descriptionEn: z.string().optional(),
  priceCents: z.coerce
    .number()
    .min(0, "يجب أن يكون السعر رقماً موجباً")
    .optional(),
  currency: z
    .nativeEnum(CreateListingBodyCurrency)
    .default(CreateListingBodyCurrency.SYP),
  isFree: z.boolean().default(false),
  isNegotiable: z.boolean().default(false),
  city: z.string().min(2, "يرجى اختيار المدينة"),
  district: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UploadedFile {
  objectPath: string;
  previewUrl: string;
  name: string;
}

export function PostListingForm() {
  const { t, locale, path } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Cities + max photos loaded from DB settings ──────────────────────────
  const [cities, setCities] = useState<Array<{ ar: string; en: string }>>([
    { ar: "دمشق", en: "Damascus" }, { ar: "حلب", en: "Aleppo" },
    { ar: "حمص", en: "Homs" }, { ar: "حماة", en: "Hama" },
    { ar: "اللاذقية", en: "Latakia" }, { ar: "طرطوس", en: "Tartus" },
    { ar: "دير الزور", en: "Deir ez-Zor" }, { ar: "الرقة", en: "Raqqa" },
    { ar: "درعا", en: "Daraa" }, { ar: "السويداء", en: "As-Suwayda" },
    { ar: "إدلب", en: "Idlib" }, { ar: "الحسكة", en: "Al-Hasakah" },
    { ar: "القنيطرة", en: "Quneitra" }, { ar: "ريف دمشق", en: "Rural Damascus" },
  ]);
  const [maxPhotos, setMaxPhotos] = useState(5);

  // ─── Draft auto-save ──────────────────────────────────────────────────────
  const [draftBanner, setDraftBanner] = useState<{
    formData: Partial<FormValues>;
  } | null>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((json: { data?: { cities?: Array<{ ar: string; en: string }>; maxImages?: number } }) => {
        if (json.data?.cities?.length) setCities(json.data.cities);
        if (typeof json.data?.maxImages === "number") setMaxPhotos(json.data.maxImages);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/listings/drafts/me")
      .then((r) => r.json())
      .then((json: { data?: { formData?: Partial<FormValues> } | null }) => {
        const fd = json.data?.formData;
        if (fd && typeof fd === "object" && Object.keys(fd).length > 0) {
          setDraftBanner({ formData: fd });
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const { data: categories } = useListCategories();
  const createListing = useCreateListing();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      categoryId: "",
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      currency: CreateListingBodyCurrency.SYP,
      isFree: false,
      isNegotiable: true,
      city: "",
      district: "",
    },
  });

  const isFree = form.watch("isFree");
  const selectedCategory = form.watch("categoryId");

  // ─── Draft debounced-save subscription (after form is initialized) ─────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const subscription = form.watch((values) => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => {
        fetch("/api/listings/drafts/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formData: values,
            imageObjectPaths: uploadedFiles.map((f) => f.objectPath),
          }),
        }).catch(() => {});
      }, 2000);
    });
    return () => {
      subscription.unsubscribe();
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [form, isAuthenticated, uploadedFiles]);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      const remaining = maxPhotos - uploadedFiles.length;
      if (remaining <= 0) {
        setUploadError(t("post.photos.max_reached"));
        return;
      }
      const toUpload = fileArray.slice(0, remaining);
      setUploadError(null);
      setIsUploading(true);

      try {
        const results = await Promise.allSettled(
          toUpload.map(async (file) => {
            const previewUrl = URL.createObjectURL(file);
            const res = await fetch("/api/storage/uploads/request-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: file.name,
                size: file.size,
                contentType: file.type,
              }),
            });
            const { uploadURL, objectPath } = await res.json();
            await fetch(uploadURL, {
              method: "PUT",
              headers: {
                "Content-Type": file.type || "application/octet-stream",
              },
              body: file,
            });
            return { objectPath, previewUrl, name: file.name } as UploadedFile;
          }),
        );

        const successful = results
          .filter(
            (r): r is PromiseFulfilledResult<UploadedFile> =>
              r.status === "fulfilled",
          )
          .map((r) => r.value);

        setUploadedFiles((prev) => [...prev, ...successful]);

        if (results.some((r) => r.status === "rejected")) {
          setUploadError(
            locale === "ar"
              ? "فشل رفع بعض الصور. يرجى المحاولة مجدداً."
              : "Some photos failed to upload. Please try again.",
          );
        }
      } finally {
        setIsUploading(false);
      }
    },
    [uploadedFiles.length, locale, t],
  );

  const removeFile = (objectPath: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.objectPath === objectPath);
      if (file) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((f) => f.objectPath !== objectPath);
    });
    setUploadError(null);
  };

  const onSubmit = (data: FormValues) => {
    if (!isAuthenticated) return;
    createListing.mutate(
      {
        data: {
          ...data,
          country: "Syria",
          imageObjectPaths: uploadedFiles.map((f) => f.objectPath),
        },
      },
      {
        onSuccess: (res) => {
          fetch("/api/listings/drafts/me", { method: "DELETE" }).catch(() => {});
          toast({
            title: t("post.success"),
            description:
              locale === "ar"
                ? "تم إضافة إعلانك بنجاح وسيظهر قريباً في السوق."
                : "Your ad has been added and will appear in the market soon.",
          });
          router.push(path(`/listings/${res.data.slug}`));
        },
        onError: (err) => {
          const msg = (err as unknown as { error?: { error?: string } })?.error
            ?.error;
          toast({
            variant: "destructive",
            title: locale === "ar" ? "حدث خطأ" : t("common.error"),
            description:
              msg ||
              (locale === "ar"
                ? "تعذّر نشر الإعلان. يرجى المحاولة مجدداً."
                : "Failed to create listing."),
          });
        },
      },
    );
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-3">{t("auth.required.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("auth.required.desc")}</p>
        <Button onClick={login} size="lg" className="rounded-full">
          {t("auth.login")}
        </Button>
      </div>
    );
  }

  const categoriesList = categories?.data ?? [];

  return (
    <>
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/40 py-10 mb-6">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground">
            {t("post.title")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("post.subtitle")}</p>
          <p className="text-xs text-muted-foreground mt-3">
            {t("post.required_note")}
          </p>
        </div>
      </div>

      {draftBanner && (
        <div className="container mx-auto px-4 max-w-2xl pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
            <p className="text-sm">
              <span className="font-semibold">
                {locale === "ar" ? "مسودة محفوظة" : "Saved draft"}
              </span>
              {" — "}
              {locale === "ar"
                ? "هل تريد استعادة البيانات المحفوظة؟"
                : "Would you like to restore your saved draft?"}
            </p>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => {
                  form.reset({ ...form.getValues(), ...draftBanner.formData });
                  setDraftBanner(null);
                }}
              >
                {locale === "ar" ? "استعادة" : "Restore"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-amber-600 hover:bg-amber-100"
                onClick={() => {
                  fetch("/api/listings/drafts/me", { method: "DELETE" }).catch(
                    () => {},
                  );
                  setDraftBanner(null);
                }}
              >
                {locale === "ar" ? "تجاهل" : "Dismiss"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-2xl pb-24">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* ─── Section 1: About ─── */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-secondary/40 border-b border-border/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                    ١
                  </span>
                  {t("post.section.about")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Category grid */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        {t("post.category")} <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                          {categoriesList.map((cat) => {
                            const icon = getCategoryIcon(
                              cat.nameAr,
                              cat.nameEn || undefined,
                              cat.slug || undefined,
                            );
                            const label =
                              locale === "ar"
                                ? cat.nameAr
                                : cat.nameEn || cat.nameAr;
                            const isSelected = field.value === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => { field.onChange(cat.id); field.onBlur(); }}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-150 hover:border-primary/60 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                  isSelected
                                    ? "border-primary bg-primary/8 shadow-sm"
                                    : "border-border/50 bg-background",
                                )}
                              >
                                <span className="text-2xl leading-none">
                                  {icon}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-medium leading-tight",
                                    isSelected
                                      ? "text-primary"
                                      : "text-foreground/80",
                                  )}
                                >
                                  {label}
                                </span>
                                {isSelected && (
                                  <Check className="h-3 w-3 text-primary absolute top-1 end-1 hidden sm:block" />
                                )}
                              </button>
                            );
                          })}
                          {categoriesList.length === 0 &&
                            Array.from({ length: 8 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-20 rounded-xl border border-border/30 bg-secondary/30 animate-pulse"
                              />
                            ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t border-border/30 pt-6 space-y-5">
                  {/* Arabic title — required */}
                  <FormField
                    control={form.control}
                    name="titleAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("post.title_ar")}{" "}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            dir="rtl"
                            placeholder="مثال: آيفون 14 برو ماكس بحالة ممتازة"
                            className={cn(
                              "transition-colors",
                              form.formState.errors.titleAr
                                ? "border-rose-400 focus-visible:ring-rose-300"
                                : "",
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-rose-500" />
                      </FormItem>
                    )}
                  />

                  {/* Arabic description — required */}
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("post.desc_ar")}{" "}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            dir="rtl"
                            rows={4}
                            placeholder="اكتب وصفاً تفصيلياً للعنصر يشمل الحالة والمواصفات وأي معلومات مهمة..."
                            className={cn(
                              "resize-none transition-colors",
                              form.formState.errors.descriptionAr
                                ? "border-rose-400 focus-visible:ring-rose-300"
                                : "",
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-rose-500" />
                      </FormItem>
                    )}
                  />

                  {/* English title — optional */}
                  <FormField
                    control={form.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          {t("post.title_en")}
                        </FormLabel>
                        <FormDescription className="text-xs">
                          {t("post.optional_auto_translate")}
                        </FormDescription>
                        <FormControl>
                          <Input
                            dir="ltr"
                            placeholder="e.g. iPhone 14 Pro Max, excellent condition"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* English description — optional */}
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          {t("post.desc_en")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            dir="ltr"
                            rows={3}
                            placeholder="Write an English description..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ─── Section 2: Price & Location ─── */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-secondary/40 border-b border-border/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                    ٢
                  </span>
                  {t("post.section.price_location")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Free toggle */}
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4">
                      <div>
                        <FormLabel className="text-base font-medium cursor-pointer">
                          {t("post.is_free")}
                        </FormLabel>
                        <FormDescription className="text-xs mt-0.5">
                          {locale === "ar"
                            ? "حدد هذا إذا كنت تقدم العنصر مجاناً"
                            : "Check this if you are giving the item away for free"}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!isFree && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price */}
                    <FormField
                      control={form.control}
                      name="priceCents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            {t("post.price")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder={
                                locale === "ar" ? "مثال: 50000" : "e.g. 50000"
                              }
                              className={cn(
                                "transition-colors",
                                form.formState.errors.priceCents
                                  ? "border-rose-400 focus-visible:ring-rose-300"
                                  : "",
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />

                    {/* Currency toggle */}
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            {t("post.currency")}
                          </FormLabel>
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
                                      isActive
                                        ? "bg-amber-500 text-white"
                                        : "bg-background text-muted-foreground hover:bg-secondary",
                                    )}
                                  >
                                    <span className="text-sm">{c.label}</span>
                                    <span className="opacity-75 text-[10px]">
                                      {c.sublabel}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Negotiable */}
                <FormField
                  control={form.control}
                  name="isNegotiable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/10 px-4 py-3">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {t("post.is_negotiable")}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="border-t border-border/30 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City — searchable combobox */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => {
                      const selected = cities.find(
                        (c) => c.ar === field.value,
                      );
                      const displayLabel = selected
                        ? locale === "ar"
                          ? selected.ar
                          : `${selected.en} — ${selected.ar}`
                        : t("post.city.placeholder");
                      return (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            {t("post.city")}{" "}
                            <span className="text-rose-500">*</span>
                          </FormLabel>
                          <Popover open={cityOpen} onOpenChange={setCityOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={cityOpen}
                                  className={cn(
                                    "w-full justify-between font-normal h-10",
                                    !field.value && "text-muted-foreground",
                                    form.formState.errors.city
                                      ? "border-rose-400"
                                      : "",
                                  )}
                                >
                                  <span className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    {displayLabel}
                                  </span>
                                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[--radix-popover-trigger-width] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder={
                                    locale === "ar"
                                      ? "ابحث عن مدينة..."
                                      : "Search city..."
                                  }
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {locale === "ar"
                                      ? "لا توجد نتائج"
                                      : "No cities found."}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {cities.map((c) => (
                                      <CommandItem
                                        key={c.ar}
                                        value={`${c.ar} ${c.en}`}
                                        onSelect={() => {
                                          field.onChange(c.ar);
                                          field.onBlur();
                                          setCityOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "me-2 h-4 w-4",
                                            field.value === c.ar
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {locale === "ar"
                                          ? c.ar
                                          : `${c.en} — ${c.ar}`}
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
                    }}
                  />

                  {/* District */}
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          {t("post.district")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              locale === "ar" ? "مثال: المزة" : "e.g. Mezzeh"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ─── Section 3: Photos ─── */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-secondary/40 border-b border-border/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                    ٣
                  </span>
                  {t("post.section.photos")}
                </CardTitle>
                <CardDescription>{t("post.photos.hint")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Counter */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("post.photos.counter", {
                      count: uploadedFiles.length,
                    })}
                  </span>
                  {uploadedFiles.length >= maxPhotos && (
                    <span className="text-amber-600 text-xs font-medium">
                      {t("post.photos.max_reached")}
                    </span>
                  )}
                </div>

                {/* Drop zone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) processFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={isUploading || uploadedFiles.length >= maxPhotos}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (uploadedFiles.length < maxPhotos) setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
                  }}
                  className={cn(
                    "w-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isDragOver
                      ? "border-primary bg-primary/8 scale-[1.01]"
                      : uploadedFiles.length >= maxPhotos
                        ? "border-border/30 bg-secondary/20 opacity-60 cursor-not-allowed"
                        : "border-primary/40 bg-primary/3 hover:border-primary hover:bg-primary/7 cursor-pointer",
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {t("post.photos.uploading")}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        {isDragOver ? (
                          <Upload className="h-6 w-6 text-primary" />
                        ) : (
                          <ImagePlus className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          {t("post.photos.drag_drop")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP — {maxPhotos} صور كحد أقصى
                        </p>
                      </div>
                    </>
                  )}
                </button>

                {uploadError && (
                  <p className="text-xs text-rose-500 text-center">
                    {uploadError}
                  </p>
                )}

                {/* Thumbnails */}
                {uploadedFiles.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={file.objectPath}
                        className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/30 bg-secondary shadow-sm group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.previewUrl}
                          alt={`photo-${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(file.objectPath)}
                          className="absolute top-1 end-1 w-5 h-5 rounded-full bg-background/90 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          aria-label={
                            locale === "ar" ? "إزالة الصورة" : "Remove photo"
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 start-1 bg-background/75 rounded px-1 text-[9px] font-bold text-foreground">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ─── Actions ─── */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => router.push(path("/listings"))}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 min-w-[180px] rounded-xl gap-2"
                disabled={createListing.isPending || isUploading}
              >
                {createListing.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {locale === "ar" ? "جاري النشر..." : "Publishing..."}
                    </span>
                  </>
                ) : (
                  t("post.submit")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
