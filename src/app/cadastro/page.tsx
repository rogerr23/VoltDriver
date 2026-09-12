import type { Metadata } from "next";

import { AuthShell } from "@/modules/auth/ui/auth-shell";
import { SignUpForm } from "@/modules/auth/ui/sign-up-form";

export const metadata: Metadata = {
  title: "Criar conta | VoltDriver",
  description: "Comece a acompanhar seus resultados no VoltDriver.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Comece com clareza"
      title="Transforme sua rotina em resultado."
      description="Crie sua conta e prepare o VoltDriver para acompanhar cada jornada de trabalho."
    >
      <SignUpForm />
    </AuthShell>
  );
}
