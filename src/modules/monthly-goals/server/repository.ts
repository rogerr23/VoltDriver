import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  calculateGoalProgress,
  calculatePeriodMetrics,
  calculateRequiredDailyAmount,
  calculateWorkSession,
  type GoalProgress,
} from "@/modules/finance/domain/calculations";
import type { MonthlyGoalInput } from "@/modules/monthly-goals/domain/monthly-goal";

type DatabaseClient = SupabaseClient<Database>;
type MonthlyGoalInsert = Database["public"]["Tables"]["monthly_goals"]["Insert"];

export interface MonthlyGoalOverview {
  month: string;
  targets: MonthlyGoalInput;
  revenue: GoalProgress;
  distance: GoalProgress;
  savings: GoalProgress;
  requiredDailyRevenue: number | null;
  remainingCalendarDaysIncludingToday: number;
}

export class MonthlyGoalPersistenceError extends Error {
  constructor(operation: "read" | "save", options?: ErrorOptions) {
    super(`Unable to ${operation} monthly goal`, options);
    this.name = "MonthlyGoalPersistenceError";
  }
}

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

export function getCurrentMonthInSaoPaulo(now = new Date()) {
  const { year, month } = getSaoPauloDateParts(now);
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function getNextMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1));
  return nextMonth.toISOString().slice(0, 10);
}

function getRemainingCalendarDaysIncludingToday(now = new Date()) {
  const { year, month, day } = getSaoPauloDateParts(now);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return daysInMonth - day + 1;
}

export async function upsertCurrentMonthGoalForUser(
  userId: string,
  input: MonthlyGoalInput,
  client?: DatabaseClient,
) {
  const supabase = client ?? (await createServerSupabaseClient());
  const values = {
    user_id: userId,
    month: getCurrentMonthInSaoPaulo(),
    revenue_target: input.revenueTarget,
    distance_target_km: input.distanceTargetKm,
    savings_target: input.savingsTarget,
  } satisfies MonthlyGoalInsert;
  const { error } = await supabase
    .from("monthly_goals")
    .upsert(values, { onConflict: "user_id,month" });

  if (error) {
    throw new MonthlyGoalPersistenceError("save", { cause: error });
  }
}

export async function getCurrentMonthGoalOverviewForUser(
  userId: string,
  client?: DatabaseClient,
): Promise<MonthlyGoalOverview> {
  const supabase = client ?? (await createServerSupabaseClient());
  const now = new Date();
  const month = getCurrentMonthInSaoPaulo(now);
  const nextMonth = getNextMonth(month);
  const [goalResult, sessionsResult] = await Promise.all([
    supabase
      .from("monthly_goals")
      .select("revenue_target,distance_target_km,savings_target")
      .eq("user_id", userId)
      .eq("month", month)
      .maybeSingle(),
    supabase
      .from("work_sessions")
      .select(
        "distance_km,online_minutes,gross_earnings,tips,vehicle_consumption_snapshot,energy_rate_snapshot,gasoline_price_snapshot,reference_fuel_efficiency_snapshot",
      )
      .eq("user_id", userId)
      .gte("work_date", month)
      .lt("work_date", nextMonth),
  ]);

  if (goalResult.error || sessionsResult.error) {
    throw new MonthlyGoalPersistenceError("read", {
      cause: goalResult.error ?? sessionsResult.error,
    });
  }

  const targets = {
    revenueTarget: goalResult.data?.revenue_target ?? 0,
    distanceTargetKm: goalResult.data?.distance_target_km ?? 0,
    savingsTarget: goalResult.data?.savings_target ?? 0,
  };
  const metrics = calculatePeriodMetrics(
    sessionsResult.data.map((session) =>
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
  const revenue = calculateGoalProgress(metrics.totalRevenue, targets.revenueTarget);
  const distance = calculateGoalProgress(metrics.distanceKm, targets.distanceTargetKm);
  const savings = calculateGoalProgress(
    Math.max(metrics.estimatedSavings, 0),
    targets.savingsTarget,
  );
  const remainingCalendarDaysIncludingToday = getRemainingCalendarDaysIncludingToday(now);

  return {
    month,
    targets,
    revenue,
    distance,
    savings,
    requiredDailyRevenue: calculateRequiredDailyAmount(
      revenue,
      remainingCalendarDaysIncludingToday,
    ),
    remainingCalendarDaysIncludingToday,
  };
}
