import { describe, expect, it } from "vitest";

import { parseVehicleFormData } from "./vehicle";

const referenceVehicle = {
  nameModel: "BYD Dolphin Mini",
  rangeKm: "280",
  consumptionKwhPer100Km: "13,5",
  residentialRatePerKwh: "0,65",
  publicRatePerKwh: "1.20",
  referenceGasolinePricePerLiter: "5,89",
  referenceFuelEfficiencyKmPerLiter: "12",
};

function createFormData(values: Partial<typeof referenceVehicle> = {}) {
  const formData = new FormData();

  Object.entries({ ...referenceVehicle, ...values }).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("vehicle configuration validation", () => {
  it("parses the reference vehicle with comma or point decimals", () => {
    expect(parseVehicleFormData(createFormData())).toEqual({
      success: true,
      data: {
        nameModel: "BYD Dolphin Mini",
        rangeKm: 280,
        consumptionKwhPer100Km: 13.5,
        residentialRatePerKwh: 0.65,
        publicRatePerKwh: 1.2,
        referenceGasolinePricePerLiter: 5.89,
        referenceFuelEfficiencyKmPerLiter: 12,
      },
    });
  });

  it("trims the vehicle name", () => {
    const result = parseVehicleFormData(
      createFormData({ nameModel: "  BYD Dolphin Mini  " }),
    );

    expect(result.success && result.data.nameModel).toBe("BYD Dolphin Mini");
  });

  it.each(["", "0", "-1", "abc", "1.200,50", "13,55555"])(
    "rejects an invalid consumption value: %s",
    (consumptionKwhPer100Km) => {
      const result = parseVehicleFormData(
        createFormData({ consumptionKwhPer100Km }),
      );

      expect(result).toEqual({
        success: false,
        fieldErrors: {
          consumptionKwhPer100Km: [
            "Informe um valor válido maior que zero.",
          ],
        },
      });
    },
  );

  it("reports every invalid field in one response", () => {
    const result = parseVehicleFormData(
      createFormData({
        nameModel: "",
        rangeKm: "0",
        residentialRatePerKwh: "",
        publicRatePerKwh: "-1",
        referenceGasolinePricePerLiter: "abc",
        referenceFuelEfficiencyKmPerLiter: "0",
      }),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(Object.keys(result.fieldErrors)).toEqual([
        "nameModel",
        "rangeKm",
        "residentialRatePerKwh",
        "publicRatePerKwh",
        "referenceGasolinePricePerLiter",
        "referenceFuelEfficiencyKmPerLiter",
      ]);
    }
  });
});
