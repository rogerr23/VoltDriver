import { describe, expect, it } from "vitest";

import {
  CalculationInputError,
  calculateChargingSession,
  calculateEnergyCost,
  calculateEstimatedEnergyKwh,
  calculateEstimatedProfit,
  calculateEstimatedSavings,
  calculateGasolineEquivalentCost,
  calculateGoalProgress,
  calculatePeriodMetrics,
  calculateRequiredDailyAmount,
  calculateWeightedEnergyRate,
  calculateWorkSession,
} from "./calculations";

describe("July 2026 reference values", () => {
  it("reconciles energy consumption, gasoline cost and savings", () => {
    const energyKwh = calculateEstimatedEnergyKwh(752.3, 13.5);
    const gasolineCost = calculateGasolineEquivalentCost(752.3, 5.89, 12);

    expect(energyKwh).toBeCloseTo(101.5605, 4);
    expect(752.3 / energyKwh).toBeCloseTo(7.4074, 4);
    expect(gasolineCost).toBeCloseTo(369.2539, 4);
    expect(calculateEstimatedSavings(gasolineCost, 120.27)).toBeCloseTo(
      248.9839,
      4,
    );
    expect(calculateEstimatedProfit(1462.4, 120.27)).toBeCloseTo(1342.13, 2);
  });

  it("calculates the final journey from the reference workbook", () => {
    const result = calculateWorkSession({
      distanceKm: 152.8,
      onlineMinutes: 8.2 * 60,
      grossEarnings: 310.18,
      tips: 1.92,
      consumptionKwhPer100Km: 13.5,
      energyRatePerKwh: 0.8645590341722938,
      gasolinePricePerLiter: 5.89,
      referenceFuelEfficiencyKmPerLiter: 12,
    });

    expect(result.totalRevenue).toBeCloseTo(312.1, 2);
    expect(result.estimatedEnergyKwh).toBeCloseTo(20.628, 3);
    expect(result.revenuePerKm).toBeCloseTo(2.0425, 4);
    expect(result.estimatedEnergyCost).toBeCloseTo(17.8341, 4);
    expect(result.estimatedSavings).toBeCloseTo(57.1652, 4);
  });
});

describe("work session calculations", () => {
  it("returns null ratios instead of plausible zeroes for empty denominators", () => {
    const result = calculateWorkSession({
      distanceKm: 0,
      onlineMinutes: 0,
      grossEarnings: 0,
      consumptionKwhPer100Km: 13.5,
      energyRatePerKwh: 0.65,
      gasolinePricePerLiter: 5.89,
      referenceFuelEfficiencyKmPerLiter: 12,
    });

    expect(result.revenuePerKm).toBeNull();
    expect(result.revenuePerHour).toBeNull();
    expect(result.profitPerKm).toBeNull();
    expect(result.profitPerHour).toBeNull();
    expect(result.efficiencyKmPerKwh).toBeNull();
  });

  it("rejects invalid inputs with the affected field", () => {
    expect(() =>
      calculateWorkSession({
        distanceKm: -1,
        onlineMinutes: 60,
        grossEarnings: 100,
        consumptionKwhPer100Km: 13.5,
        energyRatePerKwh: 0.65,
        gasolinePricePerLiter: 5.89,
        referenceFuelEfficiencyKmPerLiter: 12,
      }),
    ).toThrow(new CalculationInputError("distanceKm", "must be a finite, non-negative number"));
  });

  it("aggregates ratios from period totals", () => {
    const sessions = [
      calculateWorkSession({
        distanceKm: 100,
        onlineMinutes: 300,
        grossEarnings: 200,
        consumptionKwhPer100Km: 10,
        energyRatePerKwh: 1,
        gasolinePricePerLiter: 6,
        referenceFuelEfficiencyKmPerLiter: 12,
      }),
      calculateWorkSession({
        distanceKm: 50,
        onlineMinutes: 120,
        grossEarnings: 150,
        consumptionKwhPer100Km: 10,
        energyRatePerKwh: 1,
        gasolinePricePerLiter: 6,
        referenceFuelEfficiencyKmPerLiter: 12,
      }),
    ];

    const period = calculatePeriodMetrics(sessions);

    expect(period.sessionCount).toBe(2);
    expect(period.totalRevenue).toBe(350);
    expect(period.distanceKm).toBe(150);
    expect(period.onlineHours).toBe(7);
    expect(period.revenuePerKm).toBeCloseTo(350 / 150, 6);
    expect(period.revenuePerHour).toBe(50);
  });
});

describe("charging session calculations", () => {
  it.each([
    { rate: 0.65, expectedCostPerKm: 0.08775 },
    { rate: 1.2, expectedCostPerKm: 0.162 },
  ])("calculates estimated cost per km at $rate/kWh", ({ rate, expectedCostPerKm }) => {
    const energyKwh = 20;
    const result = calculateChargingSession({
      energyKwh,
      totalCost: calculateEnergyCost(energyKwh, rate),
      consumptionKwhPer100Km: 13.5,
      residentialRatePerKwh: 0.65,
    });

    expect(result.costPerKwh).toBeCloseTo(rate, 6);
    expect(result.estimatedCostPerKm).toBeCloseTo(expectedCostPerKm, 6);
  });

  it("compares a public charge with the configured residential rate", () => {
    const result = calculateChargingSession({
      energyKwh: 34.3,
      totalCost: 41.16,
      consumptionKwhPer100Km: 13.5,
      residentialRatePerKwh: 0.65,
    });

    expect(result.equivalentResidentialCost).toBeCloseTo(22.295, 3);
    expect(result.potentialHomeSavings).toBeCloseTo(18.865, 3);
  });
});

describe("weighted energy rate", () => {
  it("uses the residential fallback without charging history", () => {
    expect(calculateWeightedEnergyRate([], 0.65)).toEqual({
      ratePerKwh: 0.65,
      source: "residential-fallback",
    });
  });

  it("uses the energy-weighted rate from charging history", () => {
    const result = calculateWeightedEnergyRate(
      [
        { energyKwh: 20, totalCost: 13 },
        { energyKwh: 30, totalCost: 36 },
      ],
      0.65,
    );

    expect(result.ratePerKwh).toBeCloseTo(0.98, 6);
    expect(result.source).toBe("charging-history");
  });
});

describe("monthly goals", () => {
  it("calculates July revenue progress and required daily amount", () => {
    const progress = calculateGoalProgress(1462.4, 5000);

    expect(progress.percentage).toBeCloseTo(29.248, 3);
    expect(progress.remaining).toBeCloseTo(3537.6, 2);
    expect(progress.status).toBe("in-progress");
    expect(calculateRequiredDailyAmount(progress, 5)).toBeCloseTo(707.52, 2);
  });

  it("distinguishes absent, reached and expired goals", () => {
    const absent = calculateGoalProgress(0, null);
    const reached = calculateGoalProgress(5500, 5000);
    const expired = calculateGoalProgress(1000, 5000);

    expect(absent.status).toBe("not-configured");
    expect(calculateRequiredDailyAmount(absent, 10)).toBeNull();
    expect(reached.status).toBe("reached");
    expect(reached.visualPercentage).toBe(100);
    expect(reached.exceeded).toBe(500);
    expect(calculateRequiredDailyAmount(reached, 10)).toBe(0);
    expect(calculateRequiredDailyAmount(expired, 0)).toBeNull();
  });
});
