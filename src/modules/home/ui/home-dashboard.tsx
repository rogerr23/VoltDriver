import Link from "next/link";

import { BrandMark } from "@/modules/auth/ui/brand-mark";
import type { HomeDashboardData } from "@/modules/home/domain/home-dashboard";

import { BottomNavigation } from "./bottom-navigation";
import { DashboardIcon, type DashboardIconName } from "./dashboard-icon";

interface HomeDashboardProps {
  dashboard: HomeDashboardData;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const rateFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatRate(value: number | null, unit: string) {
  return value === null ? "—" : `R$ ${rateFormatter.format(value)}/${unit}`;
}

function formatDate(date: string) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatMonth(date: string) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function TodayMetric({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: DashboardIconName;
  accent: "cyan" | "violet" | "amber" | "lime";
}) {
  const accents = {
    cyan: "bg-cyan-300/10 text-cyan-300",
    violet: "bg-violet-300/10 text-violet-300",
    amber: "bg-amber-300/10 text-amber-300",
    lime: "bg-lime-300/10 text-lime-300",
  };

  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
      <div className={`grid size-9 place-items-center rounded-xl ${accents[accent]}`}>
        <DashboardIcon name={icon} className="size-[18px]" />
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-[-0.025em] text-white">{value}</p>
    </article>
  );
}

function MonthMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-base font-semibold tracking-[-0.02em] text-slate-100">{value}</dd>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime-300">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.035em] text-white">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-slate-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
        >
          {linkLabel}
          <DashboardIcon name="chevron" className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function HomeDashboard({ dashboard }: HomeDashboardProps) {
  const revenueGoal = dashboard.goals.revenue;
  const hasRevenueGoal =
    revenueGoal.target !== null && revenueGoal.target > 0 && revenueGoal.percentage !== null;
  const displayedInsights = dashboard.insights.slice(0, 3);

  return (
    <main className="min-h-dvh bg-[#07110f] text-white">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#07110f]/90 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
          <BrandMark compact />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="min-h-11 rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-8">
        <section>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <DashboardIcon name="calendar" className="size-4 text-lime-300" />
            <time dateTime={dashboard.dateLabel}>{formatDate(dashboard.dateLabel)}</time>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Como está seu trabalho hoje?
          </h1>

          <div className="mt-6 overflow-hidden rounded-3xl border border-lime-300/15 bg-gradient-to-br from-lime-300/[0.12] via-white/[0.035] to-cyan-300/[0.06] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] sm:p-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">
                  Receita hoje
                </p>
                <p className="mt-2 text-[1.75rem] font-bold tracking-[-0.045em] text-white sm:text-3xl">
                  {formatCurrency(dashboard.today.totalRevenue)}
                </p>
              </div>
              <div className="border-l border-white/10 pl-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                  Lucro estimado
                </p>
                <p className="mt-2 text-[1.75rem] font-bold tracking-[-0.045em] text-white sm:text-3xl">
                  {formatCurrency(dashboard.today.estimatedProfit)}
                </p>
              </div>
            </div>
            <p className="mt-5 border-t border-white/8 pt-4 text-xs leading-5 text-slate-500">
              Lucro operacional estimado após o custo de energia.
            </p>
          </div>

          <Link
            href="/jornadas/nova"
            className="mt-4 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-lime-400 px-5 text-base font-bold text-slate-950 shadow-[0_16px_45px_rgba(163,230,53,0.18)] transition hover:bg-lime-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
          >
            <span className="grid size-8 place-items-center rounded-full bg-slate-950/10 text-xl leading-none">+</span>
            Registrar Jornada
          </Link>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <TodayMetric label="Km rodados" value={`${decimalFormatter.format(dashboard.today.distanceKm)} km`} icon="route" accent="violet" />
            <TodayMetric label="Receita por km" value={formatRate(dashboard.today.revenuePerKm, "km")} icon="trend" accent="lime" />
            <TodayMetric label="Lucro por hora" value={formatRate(dashboard.today.profitPerHour, "h")} icon="clock" accent="cyan" />
            <TodayMetric label="Economia vs. gasolina" value={formatCurrency(dashboard.today.estimatedSavings)} icon="wallet" accent="amber" />
          </div>
        </section>

        <section className="mt-10">
          <SectionHeading eyebrow="Meta do mês" title={formatMonth(dashboard.monthLabel)} href="/metas" linkLabel="Ajustar" />
          <div className="mt-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
            {hasRevenueGoal ? (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Receita acumulada</p>
                    <p className="mt-1 text-2xl font-bold tracking-[-0.035em]">{formatCurrency(revenueGoal.actual)}</p>
                  </div>
                  <p className="text-right text-2xl font-bold text-lime-300">{Math.round(revenueGoal.percentage ?? 0)}%</p>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-cyan-300" style={{ width: `${revenueGoal.visualPercentage}%` }} />
                </div>
                <div className="mt-4 flex justify-between gap-4 text-xs text-slate-500">
                  <span>
                    {revenueGoal.status === "reached"
                      ? `Meta superada em ${formatCurrency(revenueGoal.exceeded ?? 0)}`
                      : `Faltam ${formatCurrency(revenueGoal.remaining ?? 0)}`}
                  </span>
                  <span>Meta {formatCurrency(revenueGoal.target ?? 0)}</span>
                </div>
                {dashboard.goals.requiredDailyRevenue !== null && dashboard.goals.requiredDailyRevenue > 0 && (
                  <p className="mt-4 rounded-2xl bg-lime-300/[0.07] px-4 py-3 text-sm leading-6 text-slate-300">
                    Média necessária: <strong className="text-lime-200">{formatCurrency(dashboard.goals.requiredDailyRevenue)} por dia</strong> até o fim do mês.
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-300/10 text-lime-300">
                  <DashboardIcon name="target" className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">Sua meta ainda não foi definida</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Configure um objetivo mensal para acompanhar o ritmo diário.</p>
                  <Link href="/metas" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-lime-300">
                    Definir meta
                    <DashboardIcon name="chevron" className="size-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeading eyebrow="Visão mensal" title="Seu resultado até agora" />
          <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 rounded-3xl border border-white/8 bg-white/[0.025] p-5 sm:grid-cols-3 sm:p-6">
            <MonthMetric label="Receita" value={formatCurrency(dashboard.month.totalRevenue)} />
            <MonthMetric label="Lucro estimado" value={formatCurrency(dashboard.month.estimatedProfit)} />
            <MonthMetric label="Km rodados" value={`${decimalFormatter.format(dashboard.month.distanceKm)} km`} />
            <MonthMetric label="Horas online" value={`${decimalFormatter.format(dashboard.month.onlineHours)} h`} />
            <MonthMetric label="Economia" value={formatCurrency(dashboard.month.estimatedSavings)} />
            <MonthMetric label="Custo de energia" value={formatCurrency(dashboard.month.estimatedEnergyCost)} />
          </dl>
        </section>

        <section className="mt-10">
          <SectionHeading eyebrow="Custos de recarga" title="Energia neste mês" href="/recargas/nova" linkLabel="Registrar" />
          <Link
            href="/recargas/nova"
            className="mt-4 flex min-h-24 items-center justify-between gap-4 rounded-3xl border border-amber-300/15 bg-amber-300/[0.055] p-5 transition hover:border-amber-300/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-300/10 text-amber-300">
                <DashboardIcon name="bolt" className="size-6" />
              </span>
              <div>
                <p className="text-xl font-bold tracking-[-0.03em]">{formatCurrency(dashboard.chargingThisMonth.totalCost)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {decimalFormatter.format(dashboard.chargingThisMonth.energyKwh)} kWh carregados
                  {dashboard.chargingThisMonth.costPerKwh === null ? "" : ` · ${formatRate(dashboard.chargingThisMonth.costPerKwh, "kWh")}`}
                </p>
              </div>
            </div>
            <DashboardIcon name="chevron" className="size-5 shrink-0 text-slate-500" />
          </Link>
        </section>

        <section className="mt-10">
          <SectionHeading eyebrow="Resumo inteligente" title="O que merece atenção" />
          <div className="mt-4 space-y-3">
            {displayedInsights.length > 0 ? (
              displayedInsights.map((insight) => {
                const styles = {
                  positive: "border-lime-300/15 bg-lime-300/[0.055] text-lime-300",
                  neutral: "border-cyan-300/15 bg-cyan-300/[0.045] text-cyan-300",
                  attention: "border-amber-300/15 bg-amber-300/[0.05] text-amber-300",
                }[insight.tone];

                return (
                  <article key={insight.id} className={`flex gap-3 rounded-2xl border p-4 ${styles}`}>
                    <DashboardIcon name="trend" className="mt-0.5 size-5 shrink-0" />
                    <p className="text-sm leading-6 text-slate-300">{insight.message}</p>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <p className="text-sm leading-6 text-slate-400">Registre suas jornadas e metas para receber resumos sobre o seu desempenho.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <BottomNavigation />
    </main>
  );
}
