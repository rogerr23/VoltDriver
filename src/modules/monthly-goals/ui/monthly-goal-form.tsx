"use client";

import { useActionState } from "react";

import type { GoalProgress } from "@/modules/finance/domain/calculations";
import type { MonthlyGoalActionState } from "@/modules/monthly-goals/domain/monthly-goal";
import { saveCurrentMonthGoalAction } from "@/modules/monthly-goals/server/actions";

import { MonthlyGoalField } from "./monthly-goal-field";

interface MonthlyGoalFormProps {
  monthLabel: string;
  overview: {
    targets: {
      revenueTarget: number;
      distanceTargetKm: number;
      savingsTarget: number;
    };
    revenue: GoalProgress;
    distance: GoalProgress;
    savings: GoalProgress;
    requiredDailyRevenue: number | null;
    remainingCalendarDaysIncludingToday: number;
  };
}

const initialState: MonthlyGoalActionState = { status: "idle" };

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatKilometers(value: number) {
  return `${numberFormatter.format(value)} km`;
}

function formatPercentage(value: number | null) {
  return value === null ? "Meta não definida" : `${Math.round(value)}% atingido`;
}

function defaultValue(value: number) {
  return value > 0 ? String(value).replace(".", ",") : undefined;
}

function ProgressCard({
  label,
  progress,
  format,
}: {
  label: string;
  progress: GoalProgress;
  format: (value: number) => string;
}) {
  const target = progress.target;
  const detail =
    progress.status === "not-configured"
      ? "Defina essa meta abaixo."
      : progress.status === "reached"
        ? `Você superou em ${format(progress.exceeded ?? 0)}.`
        : `Faltam ${format(progress.remaining ?? 0)}.`;

  return (
    <article className="rounded-3xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-300">{label}</p>
        <span className="text-xs font-bold text-lime-300">
          {formatPercentage(progress.percentage)}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
        {format(progress.actual)}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {target === null ? "Sem alvo no mês" : `de ${format(target)}`}
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-lime-300 transition-[width]"
          style={{ width: `${progress.visualPercentage}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
    </article>
  );
}

export function MonthlyGoalForm({ monthLabel, overview }: MonthlyGoalFormProps) {
  const [state, formAction, pending] = useActionState(
    saveCurrentMonthGoalAction,
    initialState,
  );
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const hasConfiguredGoal =
    overview.revenue.status !== "not-configured" ||
    overview.distance.status !== "not-configured" ||
    overview.savings.status !== "not-configured";

  return (
    <div className="space-y-5">
      <section aria-live="polite" className="rounded-3xl border border-lime-300/15 bg-lime-300/[0.06] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
          {monthLabel}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
          {hasConfiguredGoal ? "Seu progresso neste mês" : "Defina seu foco do mês"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {overview.requiredDailyRevenue === null
            ? "Escolha as metas que fazem sentido para a sua rotina."
            : overview.requiredDailyRevenue === 0
              ? "Sua meta de receita já foi atingida."
              : `Você precisa gerar em média ${formatCurrency(overview.requiredDailyRevenue)} por dia nos próximos ${overview.remainingCalendarDaysIncludingToday} dia${overview.remainingCalendarDaysIncludingToday === 1 ? "" : "s"}.`}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <ProgressCard label="Receita" progress={overview.revenue} format={formatCurrency} />
        <ProgressCard label="Quilômetros" progress={overview.distance} format={formatKilometers} />
        <ProgressCard label="Economia" progress={overview.savings} format={formatCurrency} />
      </section>

      <form action={formAction} aria-busy={pending} className="space-y-4">
        <fieldset className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 sm:p-6">
          <legend className="sr-only">Metas mensais</legend>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
              Configurar metas
            </p>
            <h2 className="mt-2 text-lg font-semibold">O que você quer alcançar?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Preencha uma ou mais metas. Campos vazios não entram no progresso.
            </p>
          </div>

          <div className="space-y-5">
            <MonthlyGoalField
              id="revenueTarget"
              name="revenueTarget"
              type="text"
              label="Meta de receita"
              prefix="R$"
              placeholder="Ex.: 6.000"
              inputMode="decimal"
              autoComplete="off"
              pattern="[0-9]+([.,][0-9]{1,2})?"
              maxLength={14}
              defaultValue={defaultValue(overview.targets.revenueTarget)}
              errors={errors?.revenueTarget}
            />
            <MonthlyGoalField
              id="distanceTargetKm"
              name="distanceTargetKm"
              type="text"
              label="Meta de quilômetros"
              unit="km"
              placeholder="Ex.: 3.000"
              inputMode="decimal"
              autoComplete="off"
              pattern="[0-9]+([.,][0-9]{1,2})?"
              maxLength={12}
              defaultValue={defaultValue(overview.targets.distanceTargetKm)}
              errors={errors?.distanceTargetKm}
            />
            <MonthlyGoalField
              id="savingsTarget"
              name="savingsTarget"
              type="text"
              label="Meta de economia contra gasolina"
              prefix="R$"
              placeholder="Ex.: 1.000"
              inputMode="decimal"
              autoComplete="off"
              pattern="[0-9]+([.,][0-9]{1,2})?"
              maxLength={14}
              defaultValue={defaultValue(overview.targets.savingsTarget)}
              errors={errors?.savingsTarget}
            />
          </div>
        </fieldset>

        {state.status === "error" && state.message && (
          <p role="alert" className="rounded-2xl border border-red-300/25 bg-red-300/10 px-4 py-3 text-sm text-red-100">
            {state.message}
          </p>
        )}
        {state.status === "success" && (
          <p role="status" className="rounded-2xl border border-lime-300/20 bg-lime-300/[0.08] px-4 py-3 text-sm text-lime-100">
            {state.message}
          </p>
        )}

        <div className="sticky bottom-0 -mx-5 border-t border-white/8 bg-[#07110f]/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-1">
          <button
            type="submit"
            disabled={pending}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-lime-400 px-5 text-base font-bold text-slate-950 shadow-[0_14px_40px_rgba(163,230,53,0.16)] transition hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
          >
            {pending ? "Salvando metas..." : "Salvar metas do mês"}
          </button>
        </div>
      </form>
    </div>
  );
}
