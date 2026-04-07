import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar | Cardápio Henry",
  description: "Acesso de administrador ou cliente.",
};

function LoginFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div
        className="size-10 animate-spin rounded-full border-2 border-blue-500/40 border-t-yellow-400"
        aria-hidden
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
