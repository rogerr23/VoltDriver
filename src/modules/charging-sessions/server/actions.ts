"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/modules/auth/server/session";
import {
  parseChargingSessionFormData,
  type ChargingSessionActionState,
} from "@/modules/charging-sessions/domain/charging-session";

import {
  ChargingSessionVehicleRequiredError,
  createChargingSessionForUser,
} from "./repository";

export async function createChargingSessionAction(
  _previousState: ChargingSessionActionState,
  formData: FormData,
): Promise<ChargingSessionActionState> {
  const user = await requireAuthenticatedUser();
  const result = parseChargingSessionFormData(formData);

  if (!result.success) {
    return { status: "error", fieldErrors: result.fieldErrors };
  }

  try {
    const created = await createChargingSessionForUser(user.id, result.data);

    revalidatePath("/");
    revalidatePath("/recargas");
    revalidatePath("/recargas/nova");

    return {
      status: "success",
      message: "Recarga registrada com sucesso.",
      sessionId: created.session.id,
      metrics: created.metrics,
    };
  } catch (error) {
    if (error instanceof ChargingSessionVehicleRequiredError) {
      return {
        status: "error",
        code: "vehicle-required",
        message: "Configure seu veículo antes de registrar uma recarga.",
      };
    }

    console.error("Failed to create charging session", error);

    return {
      status: "error",
      code: "persistence-error",
      message: "Não foi possível registrar a recarga. Tente novamente.",
    };
  }
}
