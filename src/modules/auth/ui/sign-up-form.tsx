"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthActionState } from "@/modules/auth/domain/forms";
import { signUpAction } from "@/modules/auth/server/actions";

import { AuthField } from "./auth-field";
import { AuthSubmitButton } from "./auth-submit-button";

const initialState: AuthActionState = { status: "idle" };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <form action={formAction} aria-busy={pending} className="space-y-5">
      <AuthField
        id="displayName"
        name="displayName"
        type="text"
        label="Como podemos chamar você?"
        placeholder="Seu nome"
        autoComplete="name"
        minLength={2}
        maxLength={80}
        required
        errors={
          state.status === "error" ? state.fieldErrors?.displayName : undefined
        }
      />

      <AuthField
        id="email"
        name="email"
        type="email"
        label="E-mail"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        inputMode="email"
        maxLength={254}
        required
        errors={state.status === "error" ? state.fieldErrors?.email : undefined}
      />

      <AuthField
        id="password"
        name="password"
        type="password"
        label="Senha"
        placeholder="Mínimo de 8 caracteres"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
        errors={
          state.status === "error" ? state.fieldErrors?.password : undefined
        }
      />

      <div aria-live="polite" aria-atomic="true" className="empty:hidden">
        {state.status !== "idle" && state.message && (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm leading-5 ${
              state.status === "confirmation-required"
                ? "border-lime-300/20 bg-lime-300/8 text-lime-200"
                : "border-red-400/20 bg-red-400/8 text-red-200"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>

      <AuthSubmitButton
        pending={pending}
        idleLabel="Criar minha conta"
        pendingLabel="Criando conta..."
      />

      <p className="pt-2 text-center text-sm text-slate-400">
        Já usa o VoltDriver?{" "}
        <Link
          href="/entrar"
          className="font-semibold text-lime-300 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
