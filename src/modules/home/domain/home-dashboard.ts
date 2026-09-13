import type {
  GoalProgress,
  PeriodMetrics,
} from "@/modules/finance/domain/calculations";

export interface ChargingPeriodSummary {
  energyKwh: number;
  totalCost: number;
  costPerKwh: number | null;
}

export interface HomeInsight {
  id: "monthly-goal" | "daily-revenue" | "profit-per-hour" | "energy-cost";
  message: string;
  tone: "positive" | "neutral" | "attention";
}

export interface HomeDashboardData {
  dateLabel: string;
  monthLabel: string;
  today: PeriodMetrics;
  month: PeriodMetrics;
  previousComparablePeriod: PeriodMetrics;
  chargingThisMonth: ChargingPeriodSummary;
  goals: {
    revenue: GoalProgress;
    distance: GoalProgress;
    savings: GoalProgress;
    requiredDailyRevenue: number | null;
    remainingCalendarDaysIncludingToday: number;
  };
  profitPerHourChangePercentage: number | null;
  insights: HomeInsight[];
}
