import slugify from "slugify";

export function makeSlug(text: string, suffix?: string): string {
  const base = slugify(text, { lower: true, strict: true, locale: "ar" })
    .replace(/-+/g, "-")
    .slice(0, 60);
  const safe = base || "item";
  const tail = suffix ?? Math.random().toString(36).slice(2, 8);
  return `${safe}-${tail}`;
}
