import { CartProvider } from "@/components/cart-provider";

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
