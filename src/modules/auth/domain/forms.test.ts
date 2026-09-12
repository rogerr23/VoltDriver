import { describe, expect, it } from "vitest";

import {
  getAuthCallbackUrl,
  getSafeRedirectPath,
  parseSignInFormData,
  parseSignUpFormData,
} from "./forms";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => formData.set(key, value));

  return formData;
}

describe("authentication forms", () => {
  it("normalizes valid sign-in credentials", () => {
    const result = parseSignInFormData(
      createFormData({ email: "  MOTORISTA@EXAMPLE.COM ", password: "senha" }),
    );

    expect(result).toEqual({
      success: true,
      data: { email: "motorista@example.com", password: "senha" },
    });
  });

  it("rejects invalid sign-in credentials", () => {
    const result = parseSignInFormData(
      createFormData({ email: "invalido", password: "" }),
    );

    expect(result).toEqual({
      success: false,
      fieldErrors: {
        email: ["Informe um e-mail válido."],
        password: ["Informe sua senha."],
      },
    });
  });

  it("validates the name and stronger password used on sign-up", () => {
    const result = parseSignUpFormData(
      createFormData({
        displayName: "R",
        email: "roger@example.com",
        password: "1234567",
      }),
    );

    expect(result).toEqual({
      success: false,
      fieldErrors: {
        displayName: ["Informe um nome entre 2 e 80 caracteres."],
        password: ["A senha deve ter pelo menos 8 caracteres."],
      },
    });
  });

  it("returns normalized valid sign-up data", () => {
    const result = parseSignUpFormData(
      createFormData({
        displayName: "  Roger Silva  ",
        email: "Roger@Example.com",
        password: "segura-123",
      }),
    );

    expect(result).toEqual({
      success: true,
      data: {
        displayName: "Roger Silva",
        email: "roger@example.com",
        password: "segura-123",
      },
    });
  });
});

describe("safe authentication redirects", () => {
  it.each([null, "", "https://example.com", "//example.com", "/\\example.com"])(
    "uses the fallback for %s",
    (destination) => {
      expect(getSafeRedirectPath(destination, "/inicio")).toBe("/inicio");
    },
  );

  it("keeps an internal path and query string", () => {
    expect(getSafeRedirectPath("/veiculo?origem=cadastro")).toBe(
      "/veiculo?origem=cadastro",
    );
  });

  it("builds a callback from a valid application origin", () => {
    expect(getAuthCallbackUrl("https://app.voltdriver.com.br")).toBe(
      "https://app.voltdriver.com.br/auth/callback",
    );
  });

  it.each([null, "invalid", "javascript:alert(1)"])(
    "rejects an invalid callback origin: %s",
    (origin) => {
      expect(getAuthCallbackUrl(origin)).toBeUndefined();
    },
  );
});
