"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <AlertTriangle className="h-12 w-12 mx-auto text-destructive/60 mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">
        حدث خطأ غير متوقع / Unexpected error
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {error.message || "Something went wrong. Please try again."}
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" className="rounded-full" onClick={reset}>
          إعادة المحاولة / Retry
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/">الرئيسية / Home</Link>
        </Button>
      </div>
    </div>
  );
}
