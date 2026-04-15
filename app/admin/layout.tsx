import { AdminGate } from "@/components/admin-gate";
import { AdminOrderNotificationProvider } from "@/components/admin-order-notification-provider";
import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <AdminOrderNotificationProvider>
        <div className="min-h-full bg-background text-zinc-900">
          <AdminNav />
          <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>
        </div>
      </AdminOrderNotificationProvider>
    </AdminGate>
  );
}
