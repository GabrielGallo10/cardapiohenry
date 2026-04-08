import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar senha | HenryBebidas",
  description: "Redefinir senha com código enviado por e-mail.",
};

export default function RecuperarSenhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
