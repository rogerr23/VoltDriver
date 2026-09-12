"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthActionState } from "@/modules/auth/domain/forms";
import { signInAction } from "@/modules/auth/server/actions";

import { AuthField } from "./auth-field";
import { AuthSubmitButton } from "./auth-submit-button";

const initialState: AuthActionState = { status: "idle" };

export function SignInForm() {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} aria-busy={pending} className="space-y-5">
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
        placeholder="Sua senha"
        autoComplete="current-password"
        maxLength={128}
        required
        errors={
          state.status === "error" ? state.fieldErrors?.password : undefined
        }
      />

      <div aria-live="polite" aria-atomic="true" className="empty:hidden">
        {state.status === "error" && state.message && (
          <p className="rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm leading-5 text-red-200">
            {state.message}
          </p>
        )}
      </div>

      <AuthSubmitButton
        pending={pending}
        idleLabel="Entrar no VoltDriver"
        pendingLabel="Entrando..."
      />

      <p className="pt-2 text-center text-sm text-slate-400">
        Ainda não tem uma conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-lime-300 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
