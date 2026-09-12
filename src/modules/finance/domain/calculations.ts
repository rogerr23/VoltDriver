export class CalculationInputError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(`${field}: ${message}`);
    this.name = "CalculationInputError";
  }
}

function assertNonNegative(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new CalculationInputError(field, "must be a finite, non-negative number");
  }
}

function assertPositive(value: number, field: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new CalculationInputError(field, "must be a finite number greater than zero");
  }
}

function divideOrNull(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : null;
}

export function calculateEstimatedEnergyKwh(
  distanceKm: number,
  consumptionKwhPer100Km: number,
) {
  assertNonNegative(distanceKm, "distanceKm");
  assertPositive(consumptionKwhPer100Km, "consumptionKwhPer100Km");

  return (distanceKm * consumptionKwhPer100Km) / 100;
}

export function calculateEnergyCost(energyKwh: number, ratePerKwh: number) {
  assertNonNegative(energyKwh, "energyKwh");
  assertNonNegative(ratePerKwh, "ratePerKwh");

  return energyKwh * ratePerKwh;
}

export function calculateGasolineEquivalentCost(
  distanceKm: number,
  gasolinePricePerLiter: number,
  referenceFuelEfficiencyKmPerLiter: number,
) {
  assertNonNegative(distanceKm, "distanceKm");
  assertNonNegative(gasolinePricePerLiter, "gasolinePricePerLiter");
  assertPositive(
    referenceFuelEfficiencyKmPerLiter,
    "referenceFuelEfficiencyKmPerLiter",
  );

  return (distanceKm / referenceFuelEfficiencyKmPerLiter) * gasolinePricePerLiter;
}

export function calculateEstimatedProfit(totalRevenue: number, energyCost: number) {
  assertNonNegative(totalRevenue, "totalRevenue");
  assertNonNegative(energyCost, "energyCost");

  return totalRevenue - energyCost;
}

export function calculateEstimatedSavings(
  gasolineEquivalentCost: number,
  energyCost: number,
) {
  assertNonNegative(gasolineEquivalentCost, "gasolineEquivalentCost");
  assertNonNegative(energyCost, "energyCost");

  return gasolineEquivalentCost - energyCost;
}

export interface WorkSessionCalculationInput {
  distanceKm: number;
  onlineMinutes: number;
  grossEarnings: number;
  tips?: number;
  consumptionKwhPer100Km: number;
  energyRatePerKwh: number;
  gasolinePricePerLiter: number;
  referenceFuelEfficiencyKmPerLiter: number;
}

export interface WorkSessionMetrics {
  distanceKm: number;
  onlineHours: number;
  totalRevenue: number;
  estimatedEnergyKwh: number;
  estimatedEnergyCost: number;
  estimatedProfit: number;
  gasolineEquivalentCost: number;
  estimatedSavings: number;
  revenuePerKm: number | null;
  revenuePerHour: number | null;
  profitPerKm: number | null;
  profitPerHour: number | null;
  efficiencyKmPerKwh: number | null;
}

export function calculateWorkSession(
  input: WorkSessionCalculationInput,
): WorkSessionMetrics {
  const tips = input.tips ?? 0;

  assertNonNegative(input.distanceKm, "distanceKm");
  assertNonNegative(input.onlineMinutes, "onlineMinutes");
  assertNonNegative(input.grossEarnings, "grossEarnings");
  assertNonNegative(tips, "tips");
  assertNonNegative(input.energyRatePerKwh, "energyRatePerKwh");
  assertNonNegative(input.gasolinePricePerLiter, "gasolinePricePerLiter");
  assertPositive(input.consumptionKwhPer100Km, "consumptionKwhPer100Km");
  assertPositive(
    input.referenceFuelEfficiencyKmPerLiter,
    "referenceFuelEfficiencyKmPerLiter",
  );

  const onlineHours = input.onlineMinutes / 60;
  const totalRevenue = input.grossEarnings + tips;
  const estimatedEnergyKwh = calculateEstimatedEnergyKwh(
    input.distanceKm,
    input.consumptionKwhPer100Km,
  );
  const estimatedEnergyCost = calculateEnergyCost(
    estimatedEnergyKwh,
    input.energyRatePerKwh,
  );
  const estimatedProfit = calculateEstimatedProfit(totalRevenue, estimatedEnergyCost);
  const gasolineEquivalentCost = calculateGasolineEquivalentCost(
    input.distanceKm,
    input.gasolinePricePerLiter,
    input.referenceFuelEfficiencyKmPerLiter,
  );
  const estimatedSavings = calculateEstimatedSavings(
    gasolineEquivalentCost,
    estimatedEnergyCost,
  );

  return {
    distanceKm: input.distanceKm,
    onlineHours,
    totalRevenue,
    estimatedEnergyKwh,
    estimatedEnergyCost,
    estimatedProfit,
    gasolineEquivalentCost,
    estimatedSavings,
    revenuePerKm: divideOrNull(totalRevenue, input.distanceKm),
    revenuePerHour: divideOrNull(totalRevenue, onlineHours),
    profitPerKm: divideOrNull(estimatedProfit, input.distanceKm),
    profitPerHour: divideOrNull(estimatedProfit, onlineHours),
    efficiencyKmPerKwh: divideOrNull(input.distanceKm, estimatedEnergyKwh),
  };
}

export interface ChargingSessionCalculationInput {
  energyKwh: number;
  totalCost: number;
  consumptionKwhPer100Km: number;
  residentialRatePerKwh: number;
}

export interface ChargingSessionMetrics {
  costPerKwh: number | null;
  configuredEfficiencyKmPerKwh: number;
  estimatedRangeKm: number;
  estimatedCostPerKm: number | null;
  equivalentResidentialCost: number;
  potentialHomeSavings: number;
}

export function calculateChargingSession(
  input: ChargingSessionCalculationInput,
): ChargingSessionMetrics {
  assertNonNegative(input.energyKwh, "energyKwh");
  assertNonNegative(input.totalCost, "totalCost");
  assertPositive(input.consumptionKwhPer100Km, "consumptionKwhPer100Km");
  assertNonNegative(input.residentialRatePerKwh, "residentialRatePerKwh");

  const configuredEfficiencyKmPerKwh = 100 / input.consumptionKwhPer100Km;
  const estimatedRangeKm = input.energyKwh * configuredEfficiencyKmPerKwh;
  const equivalentResidentialCost = calculateEnergyCost(
    input.energyKwh,
    input.residentialRatePerKwh,
  );

  return {
    costPerKwh: divideOrNull(input.totalCost, input.energyKwh),
    configuredEfficiencyKmPerKwh,
    estimatedRangeKm,
    estimatedCostPerKm: divideOrNull(input.totalCost, estimatedRangeKm),
    equivalentResidentialCost,
    potentialHomeSavings: Math.max(input.totalCost - equivalentResidentialCost, 0),
  };
}

export interface ChargingCostInput {
  energyKwh: number;
  totalCost: number;
}

export interface WeightedEnergyRate {
  ratePerKwh: number;
  source: "charging-history" | "residential-fallback";
}

export function calculateWeightedEnergyRate(
  chargingHistory: readonly ChargingCostInput[],
  residentialFallbackRate: number,
): WeightedEnergyRate {
  assertNonNegative(residentialFallbackRate, "residentialFallbackRate");

  if (chargingHistory.length === 0) {
    return {
      ratePerKwh: residentialFallbackRate,
      source: "residential-fallback",
    };
  }

  let totalEnergyKwh = 0;
  let totalCost = 0;

  chargingHistory.forEach((chargingSession, index) => {
    assertPositive(chargingSession.energyKwh, `chargingHistory[${index}].energyKwh`);
    assertNonNegative(chargingSession.totalCost, `chargingHistory[${index}].totalCost`);

    totalEnergyKwh += chargingSession.energyKwh;
    totalCost += chargingSession.totalCost;
  });

  return {
    ratePerKwh: totalCost / totalEnergyKwh,
    source: "charging-history",
  };
}

export interface PeriodMetrics extends WorkSessionMetrics {
  sessionCount: number;
}

export function calculatePeriodMetrics(
  sessions: readonly WorkSessionMetrics[],
): PeriodMetrics {
  const totals = sessions.reduce(
    (period, session) => ({
      distanceKm: period.distanceKm + session.distanceKm,
      onlineHours: period.onlineHours + session.onlineHours,
      totalRevenue: period.totalRevenue + session.totalRevenue,
      estimatedEnergyKwh: period.estimatedEnergyKwh + session.estimatedEnergyKwh,
      estimatedEnergyCost: period.estimatedEnergyCost + session.estimatedEnergyCost,
      estimatedProfit: period.estimatedProfit + session.estimatedProfit,
      gasolineEquivalentCost:
        period.gasolineEquivalentCost + session.gasolineEquivalentCost,
      estimatedSavings: period.estimatedSavings + session.estimatedSavings,
    }),
    {
      distanceKm: 0,
      onlineHours: 0,
      totalRevenue: 0,
      estimatedEnergyKwh: 0,
      estimatedEnergyCost: 0,
      estimatedProfit: 0,
      gasolineEquivalentCost: 0,
      estimatedSavings: 0,
    },
  );

  return {
    ...totals,
    sessionCount: sessions.length,
    revenuePerKm: divideOrNull(totals.totalRevenue, totals.distanceKm),
    revenuePerHour: divideOrNull(totals.totalRevenue, totals.onlineHours),
    profitPerKm: divideOrNull(totals.estimatedProfit, totals.distanceKm),
    profitPerHour: divideOrNull(totals.estimatedProfit, totals.onlineHours),
    efficiencyKmPerKwh: divideOrNull(
      totals.distanceKm,
      totals.estimatedEnergyKwh,
    ),
  };
}

export type GoalStatus = "not-configured" | "in-progress" | "reached";

export interface GoalProgress {
  target: number | null;
  actual: number;
  percentage: number | null;
  visualPercentage: number;
  remaining: number | null;
  exceeded: number | null;
  status: GoalStatus;
}

export function calculateGoalProgress(
  actual: number,
  target: number | null,
): GoalProgress {
  assertNonNegative(actual, "actual");

  if (target === null || target === 0) {
    return {
      target,
      actual,
      percentage: null,
      visualPercentage: 0,
      remaining: null,
      exceeded: null,
      status: "not-configured",
    };
  }

  assertPositive(target, "target");

  const percentage = (actual / target) * 100;
  const remaining = Math.max(target - actual, 0);
  const exceeded = Math.max(actual - target, 0);

  return {
    target,
    actual,
    percentage,
    visualPercentage: Math.min(percentage, 100),
    remaining,
    exceeded,
    status: actual >= target ? "reached" : "in-progress",
  };
}

export function calculateRequiredDailyAmount(
  progress: GoalProgress,
  remainingCalendarDaysIncludingToday: number,
) {
  if (progress.status === "not-configured" || progress.remaining === null) {
    return null;
  }

  if (progress.status === "reached") {
    return 0;
  }

  if (
    !Number.isInteger(remainingCalendarDaysIncludingToday) ||
    remainingCalendarDaysIncludingToday <= 0
  ) {
    return null;
  }

  return progress.remaining / remainingCalendarDaysIncludingToday;
}
