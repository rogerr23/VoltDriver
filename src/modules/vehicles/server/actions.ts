"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/modules/auth/server/session";
import {
  parseVehicleFormData,
  type VehicleActionState,
} from "@/modules/vehicles/domain/vehicle";

import { saveActiveVehicleForUser } from "./repository";

export async function saveVehicleAction(
  _previousState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const user = await requireAuthenticatedUser();
  const result = parseVehicleFormData(formData);

  if (!result.success) {
    return { status: "error", fieldErrors: result.fieldErrors };
  }

  try {
    const vehicle = await saveActiveVehicleForUser(user.id, result.data);

    revalidatePath("/");
    revalidatePath("/veiculo");

    return {
      status: "success",
      message: "Configurações do veículo salvas.",
      vehicleId: vehicle.id,
    };
  } catch (error) {
    console.error("Failed to save active vehicle configuration", error);

    return {
      status: "error",
      message: "Não foi possível salvar o veículo. Tente novamente.",
    };
  }
}
