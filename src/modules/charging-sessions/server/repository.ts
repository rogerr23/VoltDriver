import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  calculateChargingSession,
  type ChargingSessionMetrics,
} from "@/modules/finance/domain/calculations";
import { getActiveVehicleForUser } from "@/modules/vehicles/server/repository";
import type { ChargingSessionInput } from "@/modules/charging-sessions/domain/charging-session";

type DatabaseClient = SupabaseClient<Database>;
type ChargingSessionRow =
  Database["public"]["Tables"]["charging_sessions"]["Row"];
type ChargingSessionInsert =
  Database["public"]["Tables"]["charging_sessions"]["Insert"];

const chargingSessionColumns =
  "id,user_id,vehicle_id,charged_at,location_name,charge_type,energy_kwh,total_cost,residential_rate_snapshot,vehicle_consumption_snapshot,created_at,updated_at" as const;

export class ChargingSessionVehicleRequiredError extends Error {
  constructor() {
    super("An active vehicle is required to create a charging session");
    this.name = "ChargingSessionVehicleRequiredError";
  }
}

export class ChargingSessionPersistenceError extends Error {
  constructor(options?: ErrorOptions) {
    super("Unable to create charging session", options);
    this.name = "ChargingSessionPersistenceError";
  }
}

export interface CreatedChargingSession {
  session: ChargingSessionRow;
  metrics: ChargingSessionMetrics;
}

export async function createChargingSessionForUser(
  userId: string,
  input: ChargingSessionInput,
  client?: DatabaseClient,
): Promise<CreatedChargingSession> {
  const supabase = client ?? (await createServerSupabaseClient());
  const vehicle = await getActiveVehicleForUser(userId, supabase);

  if (!vehicle) {
    throw new ChargingSessionVehicleRequiredError();
  }

  const metrics = calculateChargingSession({
    energyKwh: input.energyKwh,
    totalCost: input.totalCost,
    consumptionKwhPer100Km: vehicle.consumption_kwh_per_100km,
    residentialRatePerKwh: vehicle.residential_rate_per_kwh,
  });
  const values = {
    user_id: userId,
    vehicle_id: vehicle.id,
    charged_at: input.chargedAt,
    location_name: input.locationName,
    charge_type: input.chargeType,
    energy_kwh: input.energyKwh,
    total_cost: input.totalCost,
    residential_rate_snapshot: vehicle.residential_rate_per_kwh,
    vehicle_consumption_snapshot: vehicle.consumption_kwh_per_100km,
  } satisfies ChargingSessionInsert;
  const { data: session, error } = await supabase
    .from("charging_sessions")
    .insert(values)
    .select(chargingSessionColumns)
    .single();

  if (error) {
    throw new ChargingSessionPersistenceError({ cause: error });
  }

  return { session, metrics };
}
