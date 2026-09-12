import type { WorkSessionMetrics } from "@/modules/finance/domain/calculations";

export const workPlatforms = ["uber", "99", "indrive", "other"] as const;

export type WorkPlatform = (typeof workPlatforms)[number];

export type WorkSessionField =
  | "workDate"
  | "platform"
  | "distanceKm"
  | "onlineHours"
  | "onlineMinutes"
  | "grossEarnings"
  | "tips";

export type WorkSessionFieldErrors = Partial<
  Record<WorkSessionField, string[]>
>;

export interface WorkSessionInput {
  workDate: string;
  platform: WorkPlatform;
  distanceKm: number;
  onlineMinutes: number;
  grossEarnings: number;
  tips: number;
}

export type WorkSessionActionState =
  | { status: "idle" }
  | {
      status: "error";
      message?: string;
      fieldErrors?: WorkSessionFieldErrors;
      code?: "vehicle-required" | "persistence-error";
    }
  | {
      status: "success";
      message: string;
      sessionId: string;
      energyRateSource: "charging-history" | "residential-fallback";
      metrics: WorkSessionMetrics;
    };

type WorkSessionValidationResult =
  | { success: true; data: WorkSessionInput }
  | { success: false; fieldErrors: WorkSessionFieldErrors };

function getText(formData: FormData, field: WorkSessionField) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function parseDecimal(
  rawValue: string,
  decimalPlaces: number,
  maximum: number,
  allowZero: boolean,
) {
  const pattern = new RegExp(`^\\d+(?:[.,]\\d{1,${decimalPlaces}})?$`);

  if (!pattern.test(rawValue)) {
    return null;
  }

  const value = Number(rawValue.replace(",", "."));
  const meetsMinimum = allowZero ? value >= 0 : value > 0;

  return Number.isFinite(value) && meetsMinimum && value <= maximum
    ? value
    : null;
}

function parseWholeNumber(rawValue: string, maximum: number) {
  if (!/^\d+$/.test(rawValue)) {
    return null;
  }

  const value = Number(rawValue);
  return Number.isSafeInteger(value) && value <= maximum ? value : null;
}

function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function parseWorkSessionFormData(
  formData: FormData,
): WorkSessionValidationResult {
  const workDate = getText(formData, "workDate");
  const platform = getText(formData, "platform");
  const distanceKm = parseDecimal(
    getText(formData, "distanceKm"),
    2,
    99_999_999.99,
    false,
  );
  const onlineHours = parseWholeNumber(getText(formData, "onlineHours"), 24);
  const onlineMinutes = parseWholeNumber(
    getText(formData, "onlineMinutes") || "0",
    59,
  );
  const grossEarnings = parseDecimal(
    getText(formData, "grossEarnings"),
    2,
    9_999_999_999.99,
    true,
  );
  const rawTips = getText(formData, "tips");
  const tips = parseDecimal(
    rawTips || "0",
    2,
    9_999_999_999.99,
    true,
  );
  const fieldErrors: WorkSessionFieldErrors = {};

  if (!isValidISODate(workDate)) {
    fieldErrors.workDate = ["Informe uma data válida."];
  }

  if (!workPlatforms.includes(platform as WorkPlatform)) {
    fieldErrors.platform = ["Selecione um aplicativo válido."];
  }

  if (distanceKm === null) {
    fieldErrors.distanceKm = ["Informe uma distância válida maior que zero."];
  }

  if (onlineHours === null) {
    fieldErrors.onlineHours = ["Informe horas inteiras entre 0 e 24."];
  }

  if (onlineMinutes === null) {
    fieldErrors.onlineMinutes = ["Informe minutos inteiros entre 0 e 59."];
  }

  if (
    onlineHours !== null &&
    onlineMinutes !== null &&
    (onlineHours * 60 + onlineMinutes === 0 ||
      (onlineHours === 24 && onlineMinutes > 0))
  ) {
    fieldErrors.onlineHours = [
      "Informe um tempo online entre 1 minuto e 24 horas.",
    ];
  }

  if (grossEarnings === null) {
    fieldErrors.grossEarnings = ["Informe um ganho bruto válido."];
  }

  if (tips === null) {
    fieldErrors.tips = ["Informe uma gorjeta válida."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      workDate,
      platform: platform as WorkPlatform,
      distanceKm: distanceKm!,
      onlineMinutes: onlineHours! * 60 + onlineMinutes!,
      grossEarnings: grossEarnings!,
      tips: tips!,
    },
  };
}
