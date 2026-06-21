import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <SearchX className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
      <h1 className="text-3xl font-bold text-foreground mb-2">404</h1>
      <p className="text-muted-foreground mb-6">
        الصفحة غير موجودة / Page not found
      </p>
      <Button asChild className="rounded-full">
        <Link href="/">الرئيسية / Home</Link>
      </Button>
    </div>
  );
}
