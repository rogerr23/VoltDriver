"use client";

import { useActionState } from "react";

import type {
  VehicleActionState,
  VehicleConfiguration,
  VehicleField,
} from "@/modules/vehicles/domain/vehicle";
import { saveVehicleAction } from "@/modules/vehicles/server/actions";

import { VehicleFormField } from "./vehicle-form-field";

interface VehicleFormProps {
  initialVehicle: VehicleConfiguration | null;
}

interface DecimalFieldDefinition {
  field: Exclude<VehicleField, "nameModel">;
  label: string;
  unit: string;
  placeholder: string;
  hint?: string;
  decimalPlaces: number;
}

const initialState: VehicleActionState = { status: "idle" };

const energyFields: readonly DecimalFieldDefinition[] = [
  {
    field: "consumptionKwhPer100Km",
    label: "Consumo médio",
    unit: "kWh/100 km",
    placeholder: "13,5",
    hint: "Consulte o manual ou o computador de bordo.",
    decimalPlaces: 4,
  },
  {
    field: "residentialRatePerKwh",
    label: "Tarifa residencial",
    unit: "R$/kWh",
    placeholder: "0,65",
    decimalPlaces: 4,
  },
  {
    field: "publicRatePerKwh",
    label: "Preço médio em recarga pública",
    unit: "R$/kWh",
    placeholder: "1,20",
    decimalPlaces: 4,
  },
];

const gasolineFields: readonly DecimalFieldDefinition[] = [
  {
    field: "referenceGasolinePricePerLiter",
    label: "Preço da gasolina",
    unit: "R$/L",
    placeholder: "5,89",
    hint: "Usado somente para estimar sua economia.",
    decimalPlaces: 4,
  },
  {
    field: "referenceFuelEfficiencyKmPerLiter",
    label: "Consumo do carro de referência",
    unit: "km/L",
    placeholder: "12",
    decimalPlaces: 4,
  },
];

function formatInitialDecimal(value: number | undefined) {
  return value === undefined ? "" : String(value).replace(".", ",");
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-6 flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-lime-400/12 text-xs font-bold text-lime-300">
          {number}
        </span>
        <div>
          <h2 className="font-semibold tracking-[-0.01em] text-white">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

export function VehicleForm({ initialVehicle }: VehicleFormProps) {
  const [state, formAction, pending] = useActionState(
    saveVehicleAction,
    initialState,
  );

  const errors = state.status === "error" ? state.fieldErrors : undefined;

  const renderDecimalField = (definition: DecimalFieldDefinition) => (
    <VehicleFormField
      key={definition.field}
      id={definition.field}
      name={definition.field}
      type="text"
      label={definition.label}
      unit={definition.unit}
      placeholder={definition.placeholder}
      hint={definition.hint}
      inputMode="decimal"
      autoComplete="off"
      pattern={`[0-9]+([.,][0-9]{1,${definition.decimalPlaces}})?`}
      maxLength={16}
      required
      defaultValue={formatInitialDecimal(initialVehicle?.[definition.field])}
      errors={errors?.[definition.field]}
    />
  );

  return (
    <form action={formAction} aria-busy={pending} className="space-y-4">
      <FormSection
        number="01"
        title="Seu elétrico"
        description="Identifique o carro e sua autonomia aproximada."
      >
        <VehicleFormField
          id="nameModel"
          name="nameModel"
          type="text"
          label="Nome ou modelo"
          placeholder="Ex.: BYD Dolphin Mini"
          autoComplete="off"
          minLength={2}
          maxLength={100}
          required
          defaultValue={initialVehicle?.nameModel ?? ""}
          errors={errors?.nameModel}
        />
        <VehicleFormField
          id="rangeKm"
          name="rangeKm"
          type="text"
          label="Autonomia aproximada"
          unit="km"
          placeholder="Ex.: 280"
          hint="Use a autonomia que você observa no dia a dia."
          inputMode="decimal"
          autoComplete="off"
          pattern="[0-9]+([.,][0-9]{1,2})?"
          maxLength={12}
          required
          defaultValue={formatInitialDecimal(initialVehicle?.rangeKm)}
          errors={errors?.rangeKm}
        />
      </FormSection>

      <FormSection
        number="02"
        title="Energia"
        description="Defina o consumo e quanto você paga para recarregar."
      >
        {energyFields.map(renderDecimalField)}
      </FormSection>

      <FormSection
        number="03"
        title="Comparação com gasolina"
        description="Escolha a referência usada para calcular sua economia."
      >
        {gasolineFields.map(renderDecimalField)}
      </FormSection>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="empty:hidden"
      >
        {state.status !== "idle" && state.message && (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm leading-5 ${
              state.status === "success"
                ? "border-lime-300/20 bg-lime-300/8 text-lime-200"
                : "border-red-400/20 bg-red-400/8 text-red-200"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 z-10 -mx-5 bg-gradient-to-t from-[#07110f] via-[#07110f] to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 sm:-mx-6 sm:px-6">
        <button
          type="submit"
          disabled={pending}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-5 text-base font-bold text-slate-950 shadow-[0_14px_40px_rgba(163,230,53,0.16)] transition hover:bg-lime-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300 disabled:cursor-wait disabled:opacity-65"
        >
          {pending && (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5 animate-spin"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                className="opacity-25"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
          )}
          {pending ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
