"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/modules/auth/server/session";
import {
  parseWorkSessionFormData,
  type WorkSessionActionState,
} from "@/modules/work-sessions/domain/work-session";

import {
  ActiveVehicleRequiredError,
  createWorkSessionForUser,
} from "./repository";

export async function createWorkSessionAction(
  _previousState: WorkSessionActionState,
  formData: FormData,
): Promise<WorkSessionActionState> {
  const user = await requireAuthenticatedUser();
  const result = parseWorkSessionFormData(formData);

  if (!result.success) {
    return { status: "error", fieldErrors: result.fieldErrors };
  }

  try {
    const created = await createWorkSessionForUser(user.id, result.data);

    revalidatePath("/");
    revalidatePath("/jornadas/nova");

    return {
      status: "success",
      message: "Jornada registrada com sucesso.",
      sessionId: created.session.id,
      energyRateSource: created.energyRateSource,
      metrics: created.metrics,
    };
  } catch (error) {
    if (error instanceof ActiveVehicleRequiredError) {
      return {
        status: "error",
        code: "vehicle-required",
        message: "Configure seu veículo antes de registrar uma jornada.",
      };
    }

    console.error("Failed to create work session", error);

    return {
      status: "error",
      code: "persistence-error",
      message: "Não foi possível registrar a jornada. Tente novamente.",
    };
  }
}
