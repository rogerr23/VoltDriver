export type MonthlyGoalField =
  | "revenueTarget"
  | "distanceTargetKm"
  | "savingsTarget";

export type MonthlyGoalFieldErrors = Partial<
  Record<MonthlyGoalField, string[]>
>;

export interface MonthlyGoalInput {
  revenueTarget: number;
  distanceTargetKm: number;
  savingsTarget: number;
}

export type MonthlyGoalActionState =
  | { status: "idle" }
  | {
      status: "error";
      message?: string;
      fieldErrors?: MonthlyGoalFieldErrors;
      code?: "persistence-error";
    }
  | { status: "success"; message: string };

type MonthlyGoalValidationResult =
  | { success: true; data: MonthlyGoalInput }
  | { success: false; fieldErrors: MonthlyGoalFieldErrors };

function getText(formData: FormData, field: MonthlyGoalField) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function parseDecimal(rawValue: string, decimalPlaces: number, maximum: number) {
  if (rawValue === "") {
    return 0;
  }

  const pattern = new RegExp(`^\\d+(?:[.,]\\d{1,${decimalPlaces}})?$`);

  if (!pattern.test(rawValue)) {
    return null;
  }

  const value = Number(rawValue.replace(",", "."));
  return Number.isFinite(value) && value >= 0 && value <= maximum ? value : null;
}

export function parseMonthlyGoalFormData(
  formData: FormData,
): MonthlyGoalValidationResult {
  const revenueTarget = parseDecimal(
    getText(formData, "revenueTarget"),
    2,
    9_999_999_999.99,
  );
  const distanceTargetKm = parseDecimal(
    getText(formData, "distanceTargetKm"),
    2,
    9_999_999.99,
  );
  const savingsTarget = parseDecimal(
    getText(formData, "savingsTarget"),
    2,
    9_999_999_999.99,
  );
  const fieldErrors: MonthlyGoalFieldErrors = {};

  if (revenueTarget === null) {
    fieldErrors.revenueTarget = ["Informe uma meta de receita válida."];
  }

  if (distanceTargetKm === null) {
    fieldErrors.distanceTargetKm = ["Informe uma meta de quilômetros válida."];
  }

  if (savingsTarget === null) {
    fieldErrors.savingsTarget = ["Informe uma meta de economia válida."];
  }

  if (
    revenueTarget !== null &&
    distanceTargetKm !== null &&
    savingsTarget !== null &&
    revenueTarget === 0 &&
    distanceTargetKm === 0 &&
    savingsTarget === 0
  ) {
    fieldErrors.revenueTarget = ["Defina pelo menos uma meta maior que zero."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      revenueTarget: revenueTarget!,
      distanceTargetKm: distanceTargetKm!,
      savingsTarget: savingsTarget!,
    },
  };
}
