import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/modules/auth/ui/brand-mark";
import { getAuthenticatedCurrentMonthGoalOverview } from "@/modules/monthly-goals/server/queries";
import { MonthlyGoalForm } from "@/modules/monthly-goals/ui/monthly-goal-form";

export const metadata: Metadata = {
  title: "Metas mensais | VoltDriver",
  description: "Defina metas e acompanhe o progresso do seu mês.",
};

function formatMonth(month: string) {
  const date = new Date(`${month}T00:00:00.000Z`);
  const value = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function MonthlyGoalsPage() {
  const overview = await getAuthenticatedCurrentMonthGoalOverview();

  return (
    <main className="min-h-dvh bg-[#07110f] text-white">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#07110f]/90 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
          <Link
            href="/"
            aria-label="Ir para a Home"
            className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
          >
            <BrandMark compact />
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="min-h-11 rounded-xl px-3 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 pb-12 pt-8 sm:px-6 sm:pt-10">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
        >
          <span aria-hidden="true">←</span>
          Voltar
        </Link>

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
            Planejamento do mês
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Suas metas mensais
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Acompanhe receita, quilômetros e economia sem complicar a sua rotina.
          </p>
        </div>

        <div className="mt-8">
          <MonthlyGoalForm overview={overview} monthLabel={formatMonth(overview.month)} />
        </div>
      </div>
    </main>
  );
}
