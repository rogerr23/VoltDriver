"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/modules/auth/server/session";
import {
  parseMonthlyGoalFormData,
  type MonthlyGoalActionState,
} from "@/modules/monthly-goals/domain/monthly-goal";

import { upsertCurrentMonthGoalForUser } from "./repository";

export async function saveCurrentMonthGoalAction(
  _previousState: MonthlyGoalActionState,
  formData: FormData,
): Promise<MonthlyGoalActionState> {
  const user = await requireAuthenticatedUser();
  const result = parseMonthlyGoalFormData(formData);

  if (!result.success) {
    return { status: "error", fieldErrors: result.fieldErrors };
  }

  try {
    await upsertCurrentMonthGoalForUser(user.id, result.data);

    revalidatePath("/");
    revalidatePath("/metas");

    return {
      status: "success",
      message: "Metas deste mês atualizadas com sucesso.",
    };
  } catch (error) {
    console.error("Failed to save monthly goal", error);

    return {
      status: "error",
      code: "persistence-error",
      message: "Não foi possível salvar as metas. Tente novamente.",
    };
  }
}
