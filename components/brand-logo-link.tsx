import Image from "next/image";
import Link from "next/link";

type BrandLogoLinkProps = {
  href: string;
  /** Acessibilidade: descreve o destino do link (ex.: "Ir para o painel"). */
  ariaLabel: string;
  /** Altura total semelhante ao bloco antigo (padding + imagem). */
  size?: "sm" | "md";
};

const sizeClass = {
  sm: "h-14 sm:h-16",
  md: "h-[4.5rem] sm:h-20 md:h-24 lg:h-[6.5rem]",
} as const;

/**
 * Logo Henry Bebidas para barras de navegação — só a imagem, sem moldura.
 */
export function BrandLogoLink({
  href,
  ariaLabel,
  size = "md",
}: BrandLogoLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="shrink-0 outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 rounded-sm"
    >
      <Image
        src="/logohenry.png"
        alt=""
        width={480}
        height={274}
        className={`w-auto object-contain object-left ${sizeClass[size]}`}
        priority
        sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 380px"
      />
    </Link>
  );
}
