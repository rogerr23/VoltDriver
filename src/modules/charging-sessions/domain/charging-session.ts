import type { ChargingSessionMetrics } from "@/modules/finance/domain/calculations";

export const chargeTypes = [
  "residential_ac",
  "public_ac",
  "public_dc",
  "other",
] as const;

export type ChargeType = (typeof chargeTypes)[number];

export type ChargingSessionField =
  | "chargedAt"
  | "locationName"
  | "chargeType"
  | "energyKwh"
  | "totalCost";

export type ChargingSessionFieldErrors = Partial<
  Record<ChargingSessionField, string[]>
>;

export interface ChargingSessionInput {
  chargedAt: string;
  locationName: string;
  chargeType: ChargeType;
  energyKwh: number;
  totalCost: number;
}

export type ChargingSessionActionState =
  | { status: "idle" }
  | {
      status: "error";
      message?: string;
      fieldErrors?: ChargingSessionFieldErrors;
      code?: "vehicle-required" | "persistence-error";
    }
  | {
      status: "success";
      message: string;
      sessionId: string;
      metrics: ChargingSessionMetrics;
    };

type ChargingSessionValidationResult =
  | { success: true; data: ChargingSessionInput }
  | { success: false; fieldErrors: ChargingSessionFieldErrors };

function getText(formData: FormData, field: ChargingSessionField) {
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

function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function parseChargingSessionFormData(
  formData: FormData,
): ChargingSessionValidationResult {
  const chargedAt = getText(formData, "chargedAt");
  const locationName = getText(formData, "locationName");
  const chargeType = getText(formData, "chargeType");
  const energyKwh = parseDecimal(
    getText(formData, "energyKwh"),
    3,
    9_999_999.999,
    false,
  );
  const totalCost = parseDecimal(
    getText(formData, "totalCost"),
    2,
    9_999_999_999.99,
    true,
  );
  const fieldErrors: ChargingSessionFieldErrors = {};

  if (!isValidISODate(chargedAt)) {
    fieldErrors.chargedAt = ["Informe uma data válida."];
  }

  if (locationName.length < 2 || locationName.length > 100) {
    fieldErrors.locationName = ["Informe um local entre 2 e 100 caracteres."];
  }

  if (!chargeTypes.includes(chargeType as ChargeType)) {
    fieldErrors.chargeType = ["Selecione um tipo de recarga válido."];
  }

  if (energyKwh === null) {
    fieldErrors.energyKwh = ["Informe uma quantidade de energia maior que zero."];
  }

  if (totalCost === null) {
    fieldErrors.totalCost = ["Informe um custo total válido."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      chargedAt,
      locationName,
      chargeType: chargeType as ChargeType,
      energyKwh: energyKwh!,
      totalCost: totalCost!,
    },
  };
}
