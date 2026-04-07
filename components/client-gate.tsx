"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  defaultPathForRole,
  getSession,
} from "@/lib/auth";

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div
        className="size-10 animate-spin rounded-full border-2 border-blue-500/40 border-t-yellow-400"
        aria-hidden
      />
      <p className="text-sm text-zinc-500">Verificando acesso…</p>
    </div>
  );
}

export function ClientGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ok">("checking");

  useEffect(() => {
    const s = getSession();
    if (s?.role === "client") {
      setState("ok");
      return;
    }
    if (s?.role === "admin") {
      router.replace(defaultPathForRole("admin"));
      return;
    }
    const path =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/cardapio";
    router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [router]);

  if (state !== "ok") return <LoadingScreen />;
  return <>{children}</>;
}
