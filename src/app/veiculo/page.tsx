import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/modules/auth/ui/brand-mark";
import type { VehicleConfiguration } from "@/modules/vehicles/domain/vehicle";
import { getAuthenticatedUserActiveVehicle } from "@/modules/vehicles/server/queries";
import { VehicleForm } from "@/modules/vehicles/ui/vehicle-form";

export const metadata: Metadata = {
  title: "Configuração do veículo | VoltDriver",
  description: "Configure o veículo e as referências de custo do VoltDriver.",
};

export default async function VehiclePage() {
  const vehicle = await getAuthenticatedUserActiveVehicle();
  const initialVehicle: VehicleConfiguration | null = vehicle
    ? {
        nameModel: vehicle.name_model,
        rangeKm: vehicle.range_km,
        consumptionKwhPer100Km: vehicle.consumption_kwh_per_100km,
        residentialRatePerKwh: vehicle.residential_rate_per_kwh,
        publicRatePerKwh: vehicle.public_rate_per_kwh,
        referenceGasolinePricePerLiter:
          vehicle.reference_gasoline_price_per_liter,
        referenceFuelEfficiencyKmPerLiter:
          vehicle.reference_fuel_efficiency_km_per_liter,
      }
    : null;

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
            Base dos seus cálculos
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Configure seu veículo
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Esses dados definem o custo de energia, o lucro estimado e a comparação com gasolina em cada jornada.
          </p>
        </div>

        {!vehicle && (
          <aside className="my-7 flex gap-3 rounded-2xl border border-lime-300/15 bg-lime-300/[0.06] p-4 text-sm leading-6 text-lime-100">
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full bg-lime-300/12 font-bold text-lime-300"
            >
              i
            </span>
            <p>
              Configure uma vez para o VoltDriver calcular automaticamente suas próximas jornadas.
            </p>
          </aside>
        )}

        <div className={vehicle ? "mt-8" : ""}>
          <VehicleForm initialVehicle={initialVehicle} />
        </div>
      </div>
    </main>
  );
}
