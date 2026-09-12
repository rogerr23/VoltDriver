import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  calculateWeightedEnergyRate,
  calculateWorkSession,
  type WorkSessionMetrics,
} from "@/modules/finance/domain/calculations";
import { getActiveVehicleForUser } from "@/modules/vehicles/server/repository";
import type { WorkSessionInput } from "@/modules/work-sessions/domain/work-session";

type DatabaseClient = SupabaseClient<Database>;
type WorkSessionRow = Database["public"]["Tables"]["work_sessions"]["Row"];
type WorkSessionInsert =
  Database["public"]["Tables"]["work_sessions"]["Insert"];

const workSessionColumns =
  "id,user_id,vehicle_id,work_date,platform,distance_km,online_minutes,gross_earnings,tips,vehicle_consumption_snapshot,energy_rate_snapshot,gasoline_price_snapshot,reference_fuel_efficiency_snapshot,created_at,updated_at" as const;

export class ActiveVehicleRequiredError extends Error {
  constructor() {
    super("An active vehicle is required to create a work session");
    this.name = "ActiveVehicleRequiredError";
  }
}

export class WorkSessionPersistenceError extends Error {
  constructor(
    operation: "read charging history" | "create",
    options?: ErrorOptions,
  ) {
    super(`Unable to ${operation} work session`, options);
    this.name = "WorkSessionPersistenceError";
  }
}

export interface CreatedWorkSession {
  session: WorkSessionRow;
  metrics: WorkSessionMetrics;
  energyRateSource: "charging-history" | "residential-fallback";
}

function roundToFourDecimals(value: number) {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

export async function createWorkSessionForUser(
  userId: string,
  input: WorkSessionInput,
  client?: DatabaseClient,
): Promise<CreatedWorkSession> {
  const supabase = client ?? (await createServerSupabaseClient());
  const vehicle = await getActiveVehicleForUser(userId, supabase);

  if (!vehicle) {
    throw new ActiveVehicleRequiredError();
  }

  const { data: chargingHistory, error: chargingHistoryError } = await supabase
    .from("charging_sessions")
    .select("energy_kwh,total_cost")
    .eq("user_id", userId)
    .eq("vehicle_id", vehicle.id)
    .lte("charged_at", input.workDate);

  if (chargingHistoryError) {
    throw new WorkSessionPersistenceError("read charging history", {
      cause: chargingHistoryError,
    });
  }

  const weightedRate = calculateWeightedEnergyRate(
    chargingHistory.map((chargingSession) => ({
      energyKwh: chargingSession.energy_kwh,
      totalCost: chargingSession.total_cost,
    })),
    vehicle.residential_rate_per_kwh,
  );
  const energyRateSnapshot = roundToFourDecimals(weightedRate.ratePerKwh);
  const metrics = calculateWorkSession({
    distanceKm: input.distanceKm,
    onlineMinutes: input.onlineMinutes,
    grossEarnings: input.grossEarnings,
    tips: input.tips,
    consumptionKwhPer100Km: vehicle.consumption_kwh_per_100km,
    energyRatePerKwh: energyRateSnapshot,
    gasolinePricePerLiter: vehicle.reference_gasoline_price_per_liter,
    referenceFuelEfficiencyKmPerLiter:
      vehicle.reference_fuel_efficiency_km_per_liter,
  });
  const values = {
    user_id: userId,
    vehicle_id: vehicle.id,
    work_date: input.workDate,
    platform: input.platform,
    distance_km: input.distanceKm,
    online_minutes: input.onlineMinutes,
    gross_earnings: input.grossEarnings,
    tips: input.tips,
    vehicle_consumption_snapshot: vehicle.consumption_kwh_per_100km,
    energy_rate_snapshot: energyRateSnapshot,
    gasoline_price_snapshot: vehicle.reference_gasoline_price_per_liter,
    reference_fuel_efficiency_snapshot:
      vehicle.reference_fuel_efficiency_km_per_liter,
  } satisfies WorkSessionInsert;
  const { data: session, error: createError } = await supabase
    .from("work_sessions")
    .insert(values)
    .select(workSessionColumns)
    .single();

  if (createError) {
    throw new WorkSessionPersistenceError("create", { cause: createError });
  }

  return {
    session,
    metrics,
    energyRateSource: weightedRate.source,
  };
}
