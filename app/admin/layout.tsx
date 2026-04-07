import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <div className="min-h-full bg-background text-zinc-900">
        <AdminNav />
        <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>
      </div>
    </AdminGate>
  );
}
