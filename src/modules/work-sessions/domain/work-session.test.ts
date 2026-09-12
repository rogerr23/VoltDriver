import { describe, expect, it } from "vitest";

import { parseWorkSessionFormData } from "./work-session";

const referenceSession = {
  workDate: "2026-07-27",
  platform: "uber",
  distanceKm: "152,8",
  onlineHours: "8",
  onlineMinutes: "12",
  grossEarnings: "310,18",
  tips: "1.92",
};

function createFormData(values: Partial<typeof referenceSession> = {}) {
  const formData = new FormData();

  Object.entries({ ...referenceSession, ...values }).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("work session validation", () => {
  it("parses the reference session and converts time to minutes", () => {
    expect(parseWorkSessionFormData(createFormData())).toEqual({
      success: true,
      data: {
        workDate: "2026-07-27",
        platform: "uber",
        distanceKm: 152.8,
        onlineMinutes: 492,
        grossEarnings: 310.18,
        tips: 1.92,
      },
    });
  });

  it("accepts every MVP platform", () => {
    ["uber", "99", "indrive", "other"].forEach((platform) => {
      expect(parseWorkSessionFormData(createFormData({ platform })).success).toBe(
        true,
      );
    });
  });

  it("treats an omitted optional tip and minute part as zero", () => {
    const formData = createFormData();
    formData.delete("tips");
    formData.delete("onlineMinutes");

    const result = parseWorkSessionFormData(formData);

    expect(result.success && result.data.tips).toBe(0);
    expect(result.success && result.data.onlineMinutes).toBe(480);
  });

  it.each(["2026-02-30", "27/07/2026", "", "not-a-date"])(
    "rejects an invalid work date: %s",
    (workDate) => {
      const result = parseWorkSessionFormData(createFormData({ workDate }));

      expect(result).toEqual({
        success: false,
        fieldErrors: { workDate: ["Informe uma data válida."] },
      });
    },
  );

  it("rejects zero time and sessions longer than 24 hours", () => {
    const zeroTime = parseWorkSessionFormData(
      createFormData({ onlineHours: "0", onlineMinutes: "0" }),
    );
    const tooLong = parseWorkSessionFormData(
      createFormData({ onlineHours: "24", onlineMinutes: "1" }),
    );

    expect(zeroTime).toEqual({
      success: false,
      fieldErrors: {
        onlineHours: ["Informe um tempo online entre 1 minuto e 24 horas."],
      },
    });
    expect(tooLong).toEqual(zeroTime);
  });

  it("reports invalid business fields together", () => {
    const result = parseWorkSessionFormData(
      createFormData({
        platform: "invalid",
        distanceKm: "0",
        onlineHours: "abc",
        onlineMinutes: "60",
        grossEarnings: "-1",
        tips: "1,999",
      }),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(Object.keys(result.fieldErrors)).toEqual([
        "platform",
        "distanceKm",
        "onlineHours",
        "onlineMinutes",
        "grossEarnings",
        "tips",
      ]);
    }
  });
});
