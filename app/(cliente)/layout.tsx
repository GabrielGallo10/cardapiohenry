import { CartProvider } from "@/components/cart-provider";
import { ClientGate } from "@/components/client-gate";

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <ClientGate>{children}</ClientGate>
    </CartProvider>
  );
}
