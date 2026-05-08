import { useEffect, useState } from "react";
import { gradientFor, monogramFor } from "@/lib/image";
import { cn } from "@/lib/utils";

interface SmartImageProps {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  imgClassName?: string;
  fallbackLabel?: string;
  rounded?: boolean;
}

export function SmartImage({
  src,
  alt,
  seed,
  className,
  imgClassName,
  fallbackLabel,
  rounded = false,
}: SmartImageProps) {
  const [errored, setErrored] = useState(false);
  useEffect(() => {
    setErrored(false);
  }, [src]);
  const showImage = src && !errored;
  const seedKey = seed || alt || "livingsyria";
  const palette = gradientFor(seedKey);
  const label = fallbackLabel ?? monogramFor(alt);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        rounded && "rounded-xl",
        className,
      )}
      style={
        !showImage
          ? {
              background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.mid} 100%)`,
            }
          : undefined
      }
    >
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            imgClassName,
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-serif font-bold tracking-tight select-none"
            style={{
              color: palette.fg,
              fontSize: "clamp(2rem, 6vw, 4rem)",
              textShadow: "0 2px 24px rgba(0,0,0,0.08)",
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
