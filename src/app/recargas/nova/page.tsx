import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/modules/auth/ui/brand-mark";
import { getAuthenticatedUserActiveVehicle } from "@/modules/vehicles/server/queries";
import { ChargingSessionForm } from "@/modules/charging-sessions/ui/charging-session-form";

export const metadata: Metadata = {
  title: "Registrar recarga | VoltDriver",
  description: "Registre uma recarga e entenda seu custo real.",
};

function getTodayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export default async function NewChargingSessionPage() {
  const vehicle = await getAuthenticatedUserActiveVehicle();

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
            Custo de energia
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Registre sua recarga
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Em poucos dados, veja o custo por km e compare com a recarga em casa.
          </p>
        </div>

        {vehicle ? (
          <div className="mt-8">
            <ChargingSessionForm defaultDate={getTodayInSaoPaulo()} />
          </div>
        ) : (
          <section className="mt-8 rounded-3xl border border-lime-300/15 bg-lime-300/[0.06] p-6">
            <span className="grid size-10 place-items-center rounded-2xl bg-lime-300/12 text-lg font-bold text-lime-300">
              ⚡
            </span>
            <h2 className="mt-5 text-xl font-semibold">Configure seu veículo primeiro</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              O consumo e a tarifa residencial são necessários para calcular o custo por km e a comparação.
            </p>
            <Link
              href="/veiculo"
              className="mt-6 flex min-h-14 items-center justify-center rounded-2xl bg-lime-400 px-5 font-bold text-slate-950 transition hover:bg-lime-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
            >
              Configurar meu veículo
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
