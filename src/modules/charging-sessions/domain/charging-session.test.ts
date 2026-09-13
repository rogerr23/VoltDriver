import { describe, expect, it } from "vitest";

import { parseChargingSessionFormData } from "./charging-session";

const referenceCharge = {
  chargedAt: "2026-07-27",
  locationName: "Posto Central",
  chargeType: "public_dc",
  energyKwh: "34,3",
  totalCost: "41.16",
};

function createFormData(values: Partial<typeof referenceCharge> = {}) {
  const formData = new FormData();

  Object.entries({ ...referenceCharge, ...values }).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("charging session validation", () => {
  it("parses the reference charge with comma or point decimals", () => {
    expect(parseChargingSessionFormData(createFormData())).toEqual({
      success: true,
      data: {
        chargedAt: "2026-07-27",
        locationName: "Posto Central",
        chargeType: "public_dc",
        energyKwh: 34.3,
        totalCost: 41.16,
      },
    });
  });

  it("accepts every MVP charge type and a free charge", () => {
    ["residential_ac", "public_ac", "public_dc", "other"].forEach(
      (chargeType) => {
        expect(
          parseChargingSessionFormData(
            createFormData({ chargeType, totalCost: "0" }),
          ).success,
        ).toBe(true);
      },
    );
  });

  it("trims the location name", () => {
    const result = parseChargingSessionFormData(
      createFormData({ locationName: "  Casa  " }),
    );

    expect(result.success && result.data.locationName).toBe("Casa");
  });

  it.each(["2026-02-30", "27/07/2026", "", "not-a-date"])(
    "rejects an invalid date: %s",
    (chargedAt) => {
      expect(parseChargingSessionFormData(createFormData({ chargedAt }))).toEqual({
        success: false,
        fieldErrors: { chargedAt: ["Informe uma data válida."] },
      });
    },
  );

  it("reports invalid business fields together", () => {
    const result = parseChargingSessionFormData(
      createFormData({
        locationName: "",
        chargeType: "invalid",
        energyKwh: "0",
        totalCost: "1,999",
      }),
    );

    expect(result).toEqual({
      success: false,
      fieldErrors: {
        locationName: ["Informe um local entre 2 e 100 caracteres."],
        chargeType: ["Selecione um tipo de recarga válido."],
        energyKwh: ["Informe uma quantidade de energia maior que zero."],
        totalCost: ["Informe um custo total válido."],
      },
    });
  });
});
