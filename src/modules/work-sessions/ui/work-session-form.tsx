"use client";

import { useActionState, useEffect } from "react";

import type {
  WorkPlatform,
  WorkSessionActionState,
} from "@/modules/work-sessions/domain/work-session";
import { createWorkSessionAction } from "@/modules/work-sessions/server/actions";

import { WorkSessionField } from "./work-session-field";

interface WorkSessionFormProps {
  defaultDate: string;
}

const initialState: WorkSessionActionState = { status: "idle" };

const platforms: readonly { value: WorkPlatform; label: string }[] = [
  { value: "uber", label: "Uber" },
  { value: "99", label: "99" },
  { value: "indrive", label: "InDrive" },
  { value: "other", label: "Outros / múltiplos" },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatMetric(value: number | null, unit: string) {
  return value === null ? "—" : `${numberFormatter.format(value)} ${unit}`;
}

function formatCurrencyRate(value: number | null, unit: string) {
  return value === null ? "—" : `${formatCurrency(value)}/${unit}`;
}

function ResultCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-lime-300/20 bg-lime-300/[0.07]"
          : "border-white/8 bg-white/[0.025]"
      }`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-2 font-semibold ${accent ? "text-lime-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

export function WorkSessionForm({ defaultDate }: WorkSessionFormProps) {
  const [state, formAction, pending] = useActionState(
    createWorkSessionAction,
    initialState,
  );
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      document
        .getElementById("journey-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  return (
    <div className="space-y-5">
      {state.status === "success" && (
        <section
          id="journey-result"
          aria-live="polite"
          className="scroll-mt-24 rounded-3xl border border-lime-300/20 bg-gradient-to-b from-lime-300/[0.12] to-white/[0.025] p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-2xl bg-lime-400 font-bold text-slate-950"
            >
              ✓
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
                Jornada salva
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                Você faturou {formatCurrency(state.metrics.totalRevenue)}.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Seu lucro operacional estimado foi {formatCurrency(state.metrics.estimatedProfit)}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <ResultCard
              label="Rendimento"
              value={formatCurrencyRate(state.metrics.revenuePerKm, "km")}
              accent
            />
            <ResultCard
              label="Lucro por hora"
              value={formatCurrencyRate(state.metrics.profitPerHour, "h")}
            />
            <ResultCard
              label="Consumo estimado"
              value={formatMetric(state.metrics.estimatedEnergyKwh, "kWh")}
            />
            <ResultCard
              label="Custo de energia"
              value={formatCurrency(state.metrics.estimatedEnergyCost)}
            />
            <ResultCard
              label="Economia vs. gasolina"
              value={formatCurrency(state.metrics.estimatedSavings)}
              accent
            />
            <ResultCard
              label="Eficiência"
              value={formatMetric(state.metrics.efficiencyKmPerKwh, "km/kWh")}
            />
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            {state.energyRateSource === "charging-history"
              ? "Custo estimado pela média das recargas registradas até esta data."
              : "Custo estimado pela sua tarifa residencial, pois ainda não havia recargas aplicáveis."}
          </p>
        </section>
      )}

      <form action={formAction} aria-busy={pending} className="space-y-4">
        <fieldset className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 sm:p-6">
          <legend className="sr-only">Quando e onde você trabalhou</legend>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
              Jornada
            </p>
            <h2 className="mt-2 text-lg font-semibold">Quando e por qual app?</h2>
          </div>

          <WorkSessionField
            id="workDate"
            name="workDate"
            type="date"
            label="Data"
            required
            defaultValue={defaultDate}
            errors={errors?.workDate}
          />

          <fieldset
            aria-describedby={errors?.platform ? "platform-error" : undefined}
            aria-invalid={Boolean(errors?.platform)}
            className="mt-5"
          >
            <legend className="mb-2 text-sm font-semibold text-slate-200">
              Aplicativo utilizado
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(({ value, label }) => (
                <label key={value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="platform"
                    value={value}
                    required
                    className="peer sr-only"
                  />
                  <span className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-center text-sm font-semibold text-slate-300 transition peer-checked:border-lime-300 peer-checked:bg-lime-300/10 peer-checked:text-lime-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {errors?.platform && (
              <p id="platform-error" className="mt-2 text-sm text-red-300">
                {errors.platform[0]}
              </p>
            )}
          </fieldset>
        </fieldset>

        <fieldset className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 sm:p-6">
          <legend className="sr-only">Totais da jornada</legend>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
              Totais
            </p>
            <h2 className="mt-2 text-lg font-semibold">O resultado do período</h2>
          </div>

          <div className="space-y-5">
            <WorkSessionField
              id="distanceKm"
              name="distanceKm"
              type="text"
              label="Km rodados"
              unit="km"
              placeholder="Ex.: 153"
              inputMode="decimal"
              autoComplete="off"
              pattern="[0-9]+([.,][0-9]{1,2})?"
              maxLength={12}
              required
              errors={errors?.distanceKm}
            />

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">
                Tempo online
              </p>
              <div className="grid grid-cols-2 gap-3">
                <WorkSessionField
                  id="onlineHours"
                  name="onlineHours"
                  type="text"
                  label="Horas"
                  unit="h"
                  placeholder="8"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]+"
                  maxLength={2}
                  required
                  errors={errors?.onlineHours}
                />
                <WorkSessionField
                  id="onlineMinutes"
                  name="onlineMinutes"
                  type="text"
                  label="Minutos"
                  unit="min"
                  placeholder="0"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]+"
                  maxLength={2}
                  errors={errors?.onlineMinutes}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <WorkSessionField
                id="grossEarnings"
                name="grossEarnings"
                type="text"
                label="Ganho bruto"
                prefix="R$"
                placeholder="312,00"
                inputMode="decimal"
                autoComplete="off"
                pattern="[0-9]+([.,][0-9]{1,2})?"
                maxLength={14}
                required
                errors={errors?.grossEarnings}
              />
              <WorkSessionField
                id="tips"
                name="tips"
                type="text"
                label="Gorjeta (opcional)"
                prefix="R$"
                placeholder="0,00"
                inputMode="decimal"
                autoComplete="off"
                pattern="[0-9]+([.,][0-9]{1,2})?"
                maxLength={14}
                errors={errors?.tips}
              />
            </div>
          </div>
        </fieldset>

        {state.status === "error" && state.message && (
          <p
            role="alert"
            className="rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm leading-5 text-red-200"
          >
            {state.message}
          </p>
        )}

        <div className="sticky bottom-0 z-10 -mx-5 bg-gradient-to-t from-[#07110f] via-[#07110f] to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 sm:-mx-6 sm:px-6">
          <button
            type="submit"
            disabled={pending}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-5 text-base font-bold text-slate-950 shadow-[0_14px_40px_rgba(163,230,53,0.16)] transition hover:bg-lime-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300 disabled:cursor-wait disabled:opacity-65"
          >
            {pending && (
              <span
                aria-hidden="true"
                className="size-5 animate-spin rounded-full border-2 border-slate-950/25 border-t-slate-950"
              />
            )}
            {pending ? "Calculando..." : "Salvar e ver resultado"}
          </button>
        </div>
      </form>
    </div>
  );
}
