import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/server/session";
import {
  calculateGoalProgress,
  calculatePeriodMetrics,
  calculateRequiredDailyAmount,
  calculateWorkSession,
  type PeriodMetrics,
} from "@/modules/finance/domain/calculations";
import type {
  ChargingPeriodSummary,
  HomeDashboardData,
  HomeInsight,
} from "@/modules/home/domain/home-dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getSaoPauloDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function formatIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDateRange(now = new Date()) {
  const { year, month, day } = getSaoPauloDateParts(now);
  const monthStart = formatIsoDate(year, month, 1);
  const today = formatIsoDate(year, month, day);
  const nextMonthStart = new Date(Date.UTC(year, month, 1))
    .toISOString()
    .slice(0, 10);
  const previousMonthStart = new Date(Date.UTC(year, month - 2, 1))
    .toISOString()
    .slice(0, 10);
  const previousMonthDays = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();
  const previousComparableEndExclusive = new Date(
    Date.UTC(year, month - 2, Math.min(day, previousMonthDays) + 1),
  )
    .toISOString()
    .slice(0, 10);
  const daysInCurrentMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    today,
    monthStart,
    nextMonthStart,
    previousMonthStart,
    previousComparableEndExclusive,
    remainingCalendarDaysIncludingToday: daysInCurrentMonth - day + 1,
  };
}

function toPeriodMetrics(
  sessions: {
    distance_km: number;
    online_minutes: number;
    gross_earnings: number;
    tips: number;
    vehicle_consumption_snapshot: number;
    energy_rate_snapshot: number;
    gasoline_price_snapshot: number;
    reference_fuel_efficiency_snapshot: number;
  }[],
) {
  return calculatePeriodMetrics(
    sessions.map((session) =>
      calculateWorkSession({
        distanceKm: session.distance_km,
        onlineMinutes: session.online_minutes,
        grossEarnings: session.gross_earnings,
        tips: session.tips,
        consumptionKwhPer100Km: session.vehicle_consumption_snapshot,
        energyRatePerKwh: session.energy_rate_snapshot,
        gasolinePricePerLiter: session.gasoline_price_snapshot,
        referenceFuelEfficiencyKmPerLiter:
          session.reference_fuel_efficiency_snapshot,
      }),
    ),
  );
}

function calculateChargingSummary(
  chargingSessions: { energy_kwh: number; total_cost: number }[],
): ChargingPeriodSummary {
  const totals = chargingSessions.reduce(
    (period, session) => ({
      energyKwh: period.energyKwh + session.energy_kwh,
      totalCost: period.totalCost + session.total_cost,
    }),
    { energyKwh: 0, totalCost: 0 },
  );

  return {
    ...totals,
    costPerKwh: totals.energyKwh > 0 ? totals.totalCost / totals.energyKwh : null,
  };
}

function calculateProfitPerHourChange(
  current: PeriodMetrics,
  previous: PeriodMetrics,
) {
  if (
    current.profitPerHour === null ||
    previous.profitPerHour === null ||
    previous.profitPerHour <= 0
  ) {
    return null;
  }

  return ((current.profitPerHour - previous.profitPerHour) / previous.profitPerHour) * 100;
}

function buildInsights(input: {
  revenuePercentage: number | null;
  revenueRemaining: number | null;
  requiredDailyRevenue: number | null;
  profitPerHourChangePercentage: number | null;
  charging: ChargingPeriodSummary;
}): HomeInsight[] {
  const insights: HomeInsight[] = [];

  if (input.revenuePercentage !== null) {
    const reached = input.revenuePercentage >= 100;
    insights.push({
      id: "monthly-goal",
      tone: reached ? "positive" : "neutral",
      message: reached
        ? "Você já atingiu sua meta mensal de receita."
        : `Você já atingiu ${Math.round(input.revenuePercentage)}% da sua meta mensal.`,
    });

    if (!reached && input.revenueRemaining !== null) {
      insights.push({
        id: "daily-revenue",
        tone: "attention",
        message:
          input.requiredDailyRevenue === null
            ? `Faltam R$ ${input.revenueRemaining.toFixed(2).replace(".", ",")} para atingir sua meta.`
            : `Faltam R$ ${input.revenueRemaining.toFixed(2).replace(".", ",")}. Sua média necessária é R$ ${input.requiredDailyRevenue.toFixed(2).replace(".", ",")} por dia.`,
      });
    }
  }

  if (input.profitPerHourChangePercentage !== null) {
    const change = Math.abs(input.profitPerHourChangePercentage).toFixed(0);
    const increased = input.profitPerHourChangePercentage > 0;
    const stable = Math.abs(input.profitPerHourChangePercentage) < 0.5;
    insights.push({
      id: "profit-per-hour",
      tone: stable ? "neutral" : increased ? "positive" : "attention",
      message: stable
        ? "Seu lucro por hora ficou estável em relação ao período anterior."
        : increased
          ? `Seu lucro por hora aumentou ${change}% em relação ao período anterior.`
          : `Seu lucro por hora caiu ${change}% em relação ao período anterior.`,
    });
  }

  if (input.charging.totalCost > 0) {
    insights.push({
      id: "energy-cost",
      tone: "neutral",
      message: `Você pagou R$ ${input.charging.totalCost.toFixed(2).replace(".", ",")} em recargas neste mês.`,
    });
  }

  return insights;
}

export async function getAuthenticatedHomeDashboard(): Promise<HomeDashboardData> {
  const user = await requireAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const now = new Date();
  const range = getDateRange(now);
  const workSessionColumns =
    "work_date,distance_km,online_minutes,gross_earnings,tips,vehicle_consumption_snapshot,energy_rate_snapshot,gasoline_price_snapshot,reference_fuel_efficiency_snapshot";
  const [monthSessionsResult, todaySessionsResult, previousSessionsResult, chargingResult, goalResult] =
    await Promise.all([
      supabase
        .from("work_sessions")
        .select(workSessionColumns)
        .eq("user_id", user.id)
        .gte("work_date", range.monthStart)
        .lt("work_date", range.nextMonthStart),
      supabase
        .from("work_sessions")
        .select(workSessionColumns)
        .eq("user_id", user.id)
        .eq("work_date", range.today),
      supabase
        .from("work_sessions")
        .select(workSessionColumns)
        .eq("user_id", user.id)
        .gte("work_date", range.previousMonthStart)
        .lt("work_date", range.previousComparableEndExclusive),
      supabase
        .from("charging_sessions")
        .select("energy_kwh,total_cost")
        .eq("user_id", user.id)
        .gte("charged_at", range.monthStart)
        .lt("charged_at", range.nextMonthStart),
      supabase
        .from("monthly_goals")
        .select("revenue_target,distance_target_km,savings_target")
        .eq("user_id", user.id)
        .eq("month", range.monthStart)
        .maybeSingle(),
    ]);

  const resultWithError = [
    monthSessionsResult,
    todaySessionsResult,
    previousSessionsResult,
    chargingResult,
    goalResult,
  ].find((result) => result.error);

  if (resultWithError?.error) {
    throw new Error("Unable to load home dashboard", { cause: resultWithError.error });
  }

  const month = toPeriodMetrics(monthSessionsResult.data);
  const today = toPeriodMetrics(todaySessionsResult.data);
  const previousComparablePeriod = toPeriodMetrics(previousSessionsResult.data);
  const chargingThisMonth = calculateChargingSummary(chargingResult.data);
  const revenue = calculateGoalProgress(month.totalRevenue, goalResult.data?.revenue_target ?? 0);
  const distance = calculateGoalProgress(month.distanceKm, goalResult.data?.distance_target_km ?? 0);
  const savings = calculateGoalProgress(
    Math.max(month.estimatedSavings, 0),
    goalResult.data?.savings_target ?? 0,
  );
  const requiredDailyRevenue = calculateRequiredDailyAmount(
    revenue,
    range.remainingCalendarDaysIncludingToday,
  );
  const profitPerHourChangePercentage = calculateProfitPerHourChange(
    month,
    previousComparablePeriod,
  );

  return {
    dateLabel: range.today,
    monthLabel: range.monthStart,
    today,
    month,
    previousComparablePeriod,
    chargingThisMonth,
    goals: {
      revenue,
      distance,
      savings,
      requiredDailyRevenue,
      remainingCalendarDaysIncludingToday: range.remainingCalendarDaysIncludingToday,
    },
    profitPerHourChangePercentage,
    insights: buildInsights({
      revenuePercentage: revenue.percentage,
      revenueRemaining: revenue.remaining,
      requiredDailyRevenue,
      profitPerHourChangePercentage,
      charging: chargingThisMonth,
    }),
  };
}
