import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Cadastro | Cardápio Henry",
  description: "Crie sua conta de cliente.",
};

export default function CadastroPage() {
  return <RegisterForm />;
}
