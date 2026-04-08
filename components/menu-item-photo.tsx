"use client";

import { useState } from "react";

type Variant = "list" | "card" | "form";

const variantFrame: Record<
  Variant,
  { outer: string; innerRadius: string; icon: string }
> = {
  list: {
    outer: "h-14 w-14 rounded-xl p-[2px]",
    innerRadius: "rounded-[10px]",
    icon: "text-lg",
  },
  card: {
    outer:
      "h-24 w-24 rounded-2xl p-[2.5px] sm:h-[6.75rem] sm:w-[6.75rem] sm:rounded-[1.35rem]",
    innerRadius: "rounded-[14px] sm:rounded-[1.15rem]",
    icon: "text-2xl sm:text-3xl",
  },
  form: {
    outer: "h-28 w-28 rounded-2xl p-[2.5px]",
    innerRadius: "rounded-[14px]",
    icon: "text-3xl",
  },
};

/**
 * Miniatura de produto com moldura em gradiente, sombra e fallback se a imagem falhar.
 */
export function MenuItemPhoto({
  src,
  alt,
  variant = "card",
  className = "",
  hoverZoom = false,
}: {
  src?: string | null;
  alt: string;
  variant?: Variant;
  className?: string;
  /** Ative quando o pai tiver `group` (ex.: card do cardápio). */
  hoverZoom?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const v = variantFrame[variant];
  const showImg = Boolean(src?.trim()) && !failed;

  return (
    <div
      className={`relative shrink-0 bg-gradient-to-br from-amber-400 via-amber-300/70 to-blue-500/80 shadow-[0_10px_28px_-6px_rgba(180,83,9,0.35),0_4px_12px_-4px_rgba(59,130,246,0.2)] ring-1 ring-white/70 ${v.outer} ${className}`}
    >
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100/95 ${v.innerRadius} ring-1 ring-inset ring-black/[0.06]`}
      >
        {showImg ? (
          <img
            src={src!.trim()}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover object-center ${hoverZoom ? "transition duration-500 ease-out group-hover:scale-[1.06]" : ""}`}
          />
        ) : (
          <span
            className={`select-none opacity-90 ${v.icon}`}
            title={failed ? "Imagem indisponível" : undefined}
            aria-hidden
          >
            🥤
          </span>
        )}
      </div>
    </div>
  );
}
