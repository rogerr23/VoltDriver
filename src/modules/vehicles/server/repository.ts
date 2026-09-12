import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { VehicleConfiguration } from "@/modules/vehicles/domain/vehicle";

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];
type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];
type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"];
type DatabaseClient = SupabaseClient<Database>;

const vehicleColumns =
  "id,user_id,name_model,range_km,consumption_kwh_per_100km,residential_rate_per_kwh,public_rate_per_kwh,reference_gasoline_price_per_liter,reference_fuel_efficiency_km_per_liter,is_active,created_at,updated_at" as const;

export class VehiclePersistenceError extends Error {
  constructor(operation: "read" | "save", options?: ErrorOptions) {
    super(`Unable to ${operation} vehicle configuration`, options);
    this.name = "VehiclePersistenceError";
  }
}

function toPersistenceValues(
  configuration: VehicleConfiguration,
): Omit<VehicleInsert, "user_id"> {
  return {
    name_model: configuration.nameModel,
    range_km: configuration.rangeKm,
    consumption_kwh_per_100km: configuration.consumptionKwhPer100Km,
    residential_rate_per_kwh: configuration.residentialRatePerKwh,
    public_rate_per_kwh: configuration.publicRatePerKwh,
    reference_gasoline_price_per_liter:
      configuration.referenceGasolinePricePerLiter,
    reference_fuel_efficiency_km_per_liter:
      configuration.referenceFuelEfficiencyKmPerLiter,
    is_active: true,
  };
}

export async function getActiveVehicleForUser(
  userId: string,
  client?: DatabaseClient,
): Promise<VehicleRow | null> {
  const supabase = client ?? (await createServerSupabaseClient());
  const { data, error } = await supabase
    .from("vehicles")
    .select(vehicleColumns)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new VehiclePersistenceError("read", { cause: error });
  }

  return data;
}

export async function saveActiveVehicleForUser(
  userId: string,
  configuration: VehicleConfiguration,
  client?: DatabaseClient,
): Promise<VehicleRow> {
  const supabase = client ?? (await createServerSupabaseClient());
  const activeVehicle = await getActiveVehicleForUser(userId, supabase);
  const values = toPersistenceValues(configuration);

  const query = activeVehicle
    ? supabase
        .from("vehicles")
        .update(values satisfies VehicleUpdate)
        .eq("id", activeVehicle.id)
        .eq("user_id", userId)
    : supabase
        .from("vehicles")
        .insert({ ...values, user_id: userId } satisfies VehicleInsert);

  const { data, error } = await query.select(vehicleColumns).single();

  if (error) {
    throw new VehiclePersistenceError("save", { cause: error });
  }

  return data;
}
