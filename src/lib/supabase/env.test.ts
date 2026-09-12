import { describe, expect, it } from "vitest";

import {
  SupabaseConfigurationError,
  getSupabasePublicConfig,
} from "./env";

describe("Supabase public configuration", () => {
  it("returns a normalized valid configuration", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "  https://example.supabase.co  ",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "  sb_publishable_example  ",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example",
    });
  });

  it.each([
    {
      environment: { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key" },
      variable: "NEXT_PUBLIC_SUPABASE_URL",
    },
    {
      environment: { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" },
      variable: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    },
  ])("rejects a missing $variable", ({ environment, variable }) => {
    expect(() => getSupabasePublicConfig(environment)).toThrow(
      new SupabaseConfigurationError(variable, "is required"),
    );
  });

  it.each(["not-a-url", "ftp://example.supabase.co"])(
    "rejects the invalid URL %s",
    (url) => {
      expect(() =>
        getSupabasePublicConfig({
          NEXT_PUBLIC_SUPABASE_URL: url,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key",
        }),
      ).toThrow(SupabaseConfigurationError);
    },
  );
});
