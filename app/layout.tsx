import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HenryBebidas",
  description:
    "HenryBebidas — distribuidora de bebidas: catálogo, pedidos e painel administrativo.",
  icons: {
    icon: "/logohenry.png",
    shortcut: "/logohenry.png",
    apple: "/logohenry.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-zinc-900">
        {children}
      </body>
    </html>
  );
}
