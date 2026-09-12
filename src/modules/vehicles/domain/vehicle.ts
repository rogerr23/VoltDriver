export type VehicleField =
  | "nameModel"
  | "rangeKm"
  | "consumptionKwhPer100Km"
  | "residentialRatePerKwh"
  | "publicRatePerKwh"
  | "referenceGasolinePricePerLiter"
  | "referenceFuelEfficiencyKmPerLiter";

export type VehicleFieldErrors = Partial<Record<VehicleField, string[]>>;

export interface VehicleConfiguration {
  nameModel: string;
  rangeKm: number;
  consumptionKwhPer100Km: number;
  residentialRatePerKwh: number;
  publicRatePerKwh: number;
  referenceGasolinePricePerLiter: number;
  referenceFuelEfficiencyKmPerLiter: number;
}

export type VehicleActionState =
  | { status: "idle" }
  | { status: "error"; message?: string; fieldErrors?: VehicleFieldErrors }
  | { status: "success"; message: string; vehicleId: string };

type VehicleValidationResult =
  | { success: true; data: VehicleConfiguration }
  | { success: false; fieldErrors: VehicleFieldErrors };

interface DecimalFieldRule {
  field: Exclude<VehicleField, "nameModel">;
  decimalPlaces: number;
  maximum: number;
}

const decimalFields: readonly DecimalFieldRule[] = [
  { field: "rangeKm", decimalPlaces: 2, maximum: 99_999_999.99 },
  {
    field: "consumptionKwhPer100Km",
    decimalPlaces: 4,
    maximum: 999_999.9999,
  },
  {
    field: "residentialRatePerKwh",
    decimalPlaces: 4,
    maximum: 999_999.9999,
  },
  {
    field: "publicRatePerKwh",
    decimalPlaces: 4,
    maximum: 999_999.9999,
  },
  {
    field: "referenceGasolinePricePerLiter",
    decimalPlaces: 4,
    maximum: 999_999.9999,
  },
  {
    field: "referenceFuelEfficiencyKmPerLiter",
    decimalPlaces: 4,
    maximum: 999_999.9999,
  },
];

function getText(formData: FormData, field: VehicleField) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveDecimal(
  rawValue: string,
  decimalPlaces: number,
  maximum: number,
) {
  const pattern = new RegExp(`^\\d+(?:[.,]\\d{1,${decimalPlaces}})?$`);

  if (!pattern.test(rawValue)) {
    return null;
  }

  const value = Number(rawValue.replace(",", "."));

  if (!Number.isFinite(value) || value <= 0 || value > maximum) {
    return null;
  }

  return value;
}

export function parseVehicleFormData(
  formData: FormData,
): VehicleValidationResult {
  const nameModel = getText(formData, "nameModel");
  const fieldErrors: VehicleFieldErrors = {};
  const parsedValues: Partial<
    Record<Exclude<VehicleField, "nameModel">, number>
  > = {};

  if (nameModel.length < 2 || nameModel.length > 100) {
    fieldErrors.nameModel = ["Informe um modelo entre 2 e 100 caracteres."];
  }

  decimalFields.forEach(({ field, decimalPlaces, maximum }) => {
    const parsedValue = parsePositiveDecimal(
      getText(formData, field),
      decimalPlaces,
      maximum,
    );

    if (parsedValue === null) {
      fieldErrors[field] = ["Informe um valor válido maior que zero."];
      return;
    }

    parsedValues[field] = parsedValue;
  });

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      nameModel,
      rangeKm: parsedValues.rangeKm!,
      consumptionKwhPer100Km: parsedValues.consumptionKwhPer100Km!,
      residentialRatePerKwh: parsedValues.residentialRatePerKwh!,
      publicRatePerKwh: parsedValues.publicRatePerKwh!,
      referenceGasolinePricePerLiter:
        parsedValues.referenceGasolinePricePerLiter!,
      referenceFuelEfficiencyKmPerLiter:
        parsedValues.referenceFuelEfficiencyKmPerLiter!,
    },
  };
}
