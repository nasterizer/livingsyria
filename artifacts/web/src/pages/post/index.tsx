import { useI18n } from "@/lib/i18n";
import { useCreateListing, useListCategories } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { ObjectUploader } from "@workspace/object-storage-web";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
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
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreateListingBodyCurrency } from "@workspace/api-client-react";

const formSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  titleAr: z.string().min(3, "Title must be at least 3 characters"),
  titleEn: z.string().optional(),
  descriptionAr: z.string().min(10, "Description must be at least 10 characters"),
  descriptionEn: z.string().optional(),
  priceCents: z.coerce.number().optional(),
  currency: z.nativeEnum(CreateListingBodyCurrency).default(CreateListingBodyCurrency.SYP),
  isFree: z.boolean().default(false),
  isNegotiable: z.boolean().default(false),
  city: z.string().min(2, "City is required"),
  district: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PostListing() {
  const { t, locale } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [imageObjectPaths, setImageObjectPaths] = useState<string[]>([]);

  const { data: categories } = useListCategories();
  const createListing = useCreateListing();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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

  const onSubmit = (data: FormValues) => {
    if (!isAuthenticated) return;

    createListing.mutate({
      data: {
        ...data,
        country: "Syria",
        imageObjectPaths,
      }
    }, {
      onSuccess: (res) => {
        toast({
          title: t("post.success"),
          description: locale === "ar" ? "تم إضافة إعلانك بنجاح" : "Your ad has been added successfully.",
        });
        setLocation(`/listings/${res.data.slug}`);
      },
      onError: (err) => {
        const msg = (err as unknown as { error?: { error?: string } })?.error?.error;
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: msg || "Failed to create listing",
        });
      }
    });
  };

  if (isAuthLoading) {
    return <div className="container py-24 text-center">{t("common.loading")}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">You need to log in to post a listing.</p>
        <Button onClick={() => window.location.href = '/api/login?returnTo=/post'}>
          {t("auth.login")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("post.title")} - LivingSyria</title>
      </Helmet>

      <div className="bg-secondary/30 border-b border-border/40 py-8 mb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-serif font-bold text-foreground">{t("post.title")}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl pb-24">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>{t("post.category")}</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder={t("post.category.placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.data.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {locale === "ar" ? cat.nameAr : (cat.nameEn || cat.nameAr)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>{locale === "ar" ? "تفاصيل الإعلان" : "Ad Details"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="titleAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("post.title_ar")}</FormLabel>
                      <FormControl>
                        <Input dir="rtl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("post.title_en")}</FormLabel>
                      <FormControl>
                        <Input dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("post.desc_ar")}</FormLabel>
                      <FormControl>
                        <Textarea dir="rtl" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("post.desc_en")}</FormLabel>
                      <FormControl>
                        <Textarea dir="ltr" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>{t("post.price")} & {locale === "ar" ? "الموقع" : "Location"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t("post.is_free")}</FormLabel>
                        <FormDescription>
                          {locale === "ar" ? "حدد هذا إذا كنت تقدم العنصر مجاناً" : "Check this if you are giving the item away for free"}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="priceCents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("post.price")} (في حال عدم التحديد سيظهر "تواصل لمعرفة السعر")</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("post.currency")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SYP">SYP - الليرة السورية</SelectItem>
                              <SelectItem value="USD">USD - دولار أمريكي</SelectItem>
                              <SelectItem value="EUR">EUR - يورو</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="isNegotiable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{t("post.is_negotiable")}</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/40">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("post.city")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("post.district")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>{t("post.images")}</CardTitle>
                <CardDescription>
                  {locale === "ar" 
                    ? "أضف صوراً واضحة لزيادة فرص بيع العنصر" 
                    : "Add clear images to increase your chances of selling the item"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ObjectUploader
                  maxNumberOfFiles={8}
                  onGetUploadParameters={async (file) => {
                    const res = await fetch("/api/storage/uploads/request-url", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: file.name,
                        size: file.size,
                        contentType: file.type,
                      }),
                    });
                    const data = await res.json();
                    file.meta = { ...file.meta, objectPath: data.objectPath };
                    return {
                      method: "PUT",
                      url: data.uploadURL,
                      headers: { "Content-Type": file.type ?? "application/octet-stream" },
                    };
                  }}
                  onComplete={(result) => {
                    const newPaths = (result.successful ?? [])
                      .map((f) => (f.meta as { objectPath?: string } | undefined)?.objectPath)
                      .filter((p): p is string => typeof p === "string");
                    if (newPaths.length > 0) {
                      setImageObjectPaths((prev) => [...prev, ...newPaths]);
                      toast({
                        title: locale === "ar" ? "تم رفع الصور" : "Images uploaded",
                        description: locale === "ar"
                          ? `تم رفع ${newPaths.length} صورة بنجاح.`
                          : `Successfully uploaded ${newPaths.length} image(s).`,
                      });
                    }
                  }}
                >
                  {locale === "ar" ? "رفع الصور" : "Upload images"}
                </ObjectUploader>
                {imageObjectPaths.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {imageObjectPaths.map((path, idx) => (
                      <div key={path} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50 bg-secondary">
                        <img src={`/api${path}`} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageObjectPaths((prev) => prev.filter((p) => p !== path))}
                          className="absolute top-1 right-1 bg-background/90 text-foreground rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation("/listings")}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90" disabled={createListing.isPending}>
                {createListing.isPending ? t("common.loading") : t("post.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
