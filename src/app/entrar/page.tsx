import type { Metadata } from "next";

import { AuthShell } from "@/modules/auth/ui/auth-shell";
import { SignInForm } from "@/modules/auth/ui/sign-in-form";

export const metadata: Metadata = {
  title: "Entrar | VoltDriver",
  description: "Acesse seu painel VoltDriver.",
};

interface SignInPageProps {
  searchParams: Promise<{ status?: string | string[] }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { status } = await searchParams;
  const hasInvalidConfirmation = status === "confirmacao-invalida";

  return (
    <AuthShell
      eyebrow="Bem-vindo de volta"
      title="Veja o que realmente ficou no bolso."
      description="Entre para acompanhar sua jornada, seus custos de energia e o progresso do mês."
    >
      {hasInvalidConfirmation && (
        <p
          role="alert"
          className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/8 px-4 py-3 text-sm leading-5 text-amber-100"
        >
          Este link de confirmação é inválido ou expirou. Tente criar a conta novamente.
        </p>
      )}
      <SignInForm />
    </AuthShell>
  );
}
