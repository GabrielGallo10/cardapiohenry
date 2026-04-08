import Image from "next/image";

/** Logo acima do título nos cartões de Entrar, Cadastro e Recuperar senha. */
export function AuthCardLogo() {
  return (
    <div className="mx-auto mb-5 flex justify-center">
      <Image
        src="/logohenry.png"
        alt="Henry Bebidas"
        width={360}
        height={204}
        className="h-20 w-auto object-contain sm:h-24 md:h-28"
        priority
        sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 360px"
      />
    </div>
  );
}
