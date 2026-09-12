import type { ReactNode } from "react";

import { BrandMark } from "./brand-mark";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

const benefits = [
  "Lucro, receita e custos em um só lugar",
  "Indicadores claros por km e por hora",
  "Comparação real com o custo da gasolina",
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#07110f] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.16),transparent_58%)]"
      />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-6xl lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <section className="hidden border-r border-white/8 px-12 py-12 lg:flex lg:flex-col lg:justify-between">
          <BrandMark />

          <div className="max-w-lg pb-10">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">
              Feito para quem dirige elétrico
            </span>
            <h2 className="text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-balance">
              Decisões melhores começam com números claros.
            </h2>
            <ul className="mt-10 space-y-4 text-sm text-slate-300">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-lime-400/12 text-lime-300">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="size-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <path d="m5 10 3 3 7-7" />
                    </svg>
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Informação objetiva para sua rotina ao volante.
          </p>
        </section>

        <section className="flex min-h-dvh flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 lg:justify-center lg:px-16 lg:py-12">
          <div className="mb-12 lg:hidden">
            <BrandMark compact />
          </div>

          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-balance sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400 sm:text-base">
              {description}
            </p>

            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
