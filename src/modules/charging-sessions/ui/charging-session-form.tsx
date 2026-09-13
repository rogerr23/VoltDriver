"use client";

import { useActionState, useEffect } from "react";

import type {
  ChargeType,
  ChargingSessionActionState,
} from "@/modules/charging-sessions/domain/charging-session";
import { createChargingSessionAction } from "@/modules/charging-sessions/server/actions";

import { ChargingSessionField } from "./charging-session-field";

interface ChargingSessionFormProps {
  defaultDate: string;
}

const initialState: ChargingSessionActionState = { status: "idle" };

const chargeTypes: readonly { value: ChargeType; label: string }[] = [
  { value: "residential_ac", label: "Casa / AC" },
  { value: "public_ac", label: "Pública / AC" },
  { value: "public_dc", label: "Pública / DC" },
  { value: "other", label: "Outro" },
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

function ResultCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
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

export function ChargingSessionForm({ defaultDate }: ChargingSessionFormProps) {
  const [state, formAction, pending] = useActionState(
    createChargingSessionAction,
    initialState,
  );
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      document
        .getElementById("charging-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  return (
    <div className="space-y-5">
      {state.status === "success" && (
        <section
          id="charging-result"
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
                Recarga salva
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                Você carregou {formatMetric(state.metrics.estimatedRangeKm / state.metrics.configuredEfficiencyKmPerKwh, "kWh")}.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Esta recarga custou {formatCurrencyRate(state.metrics.costPerKwh, "kWh")}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <ResultCard
              label="Custo por kWh"
              value={formatCurrencyRate(state.metrics.costPerKwh, "kWh")}
              accent
            />
            <ResultCard
              label="Custo estimado por km"
              value={formatCurrencyRate(state.metrics.estimatedCostPerKm, "km")}
            />
            <ResultCard
              label="Autonomia estimada"
              value={formatMetric(state.metrics.estimatedRangeKm, "km")}
            />
            <ResultCard
              label="Em casa custaria"
              value={formatCurrency(state.metrics.equivalentResidentialCost)}
            />
          </div>

          <p className="mt-4 rounded-2xl bg-white/[0.035] px-4 py-3 text-sm leading-6 text-slate-300">
            {state.metrics.potentialHomeSavings > 0
              ? `Com a sua tarifa residencial, essa mesma energia custaria ${formatCurrency(state.metrics.equivalentResidentialCost)}. Você teria economizado ${formatCurrency(state.metrics.potentialHomeSavings)} em casa.`
              : "Esta recarga ficou no mesmo preço ou mais barata que a sua tarifa residencial."}
          </p>
        </section>
      )}

      <form action={formAction} aria-busy={pending} className="space-y-4">
        <fieldset className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 sm:p-6">
          <legend className="sr-only">Detalhes da recarga</legend>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
              Detalhes
            </p>
            <h2 className="mt-2 text-lg font-semibold">Onde você carregou?</h2>
          </div>

          <div className="space-y-5">
            <ChargingSessionField
              id="chargedAt"
              name="chargedAt"
              type="date"
              label="Data"
              required
              defaultValue={defaultDate}
              errors={errors?.chargedAt}
            />
            <ChargingSessionField
              id="locationName"
              name="locationName"
              type="text"
              label="Local"
              placeholder="Ex.: Posto Central"
              autoComplete="off"
              minLength={2}
              maxLength={100}
              required
              errors={errors?.locationName}
            />
          </div>

          <fieldset
            aria-describedby={errors?.chargeType ? "charge-type-error" : undefined}
            aria-invalid={Boolean(errors?.chargeType)}
            className="mt-5"
          >
            <legend className="mb-2 text-sm font-semibold text-slate-200">
              Tipo de recarga
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {chargeTypes.map(({ value, label }) => (
                <label key={value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="chargeType"
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
            {errors?.chargeType && (
              <p id="charge-type-error" className="mt-2 text-sm text-red-300">
                {errors.chargeType[0]}
              </p>
            )}
          </fieldset>
        </fieldset>

        <fieldset className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 sm:p-6">
          <legend className="sr-only">Energia e custo</legend>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
              Energia e custo
            </p>
            <h2 className="mt-2 text-lg font-semibold">Quanto entrou e quanto custou?</h2>
          </div>

          <div className="space-y-5">
            <ChargingSessionField
              id="energyKwh"
              name="energyKwh"
              type="text"
              label="kWh carregados"
              unit="kWh"
              placeholder="Ex.: 34,3"
              inputMode="decimal"
              autoComplete="off"
              pattern="[0-9]+([.,][0-9]{1,3})?"
              maxLength={12}
              required
              errors={errors?.energyKwh}
            />
            <ChargingSessionField
              id="totalCost"
              name="totalCost"
              type="text"
              label="Custo total"
              prefix="R$"
              placeholder="Ex.: 41,16"
              inputMode="decimal"
              autoComplete="off"
              pattern="[0-9]+([.,][0-9]{1,2})?"
              maxLength={14}
              required
              errors={errors?.totalCost}
            />
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
