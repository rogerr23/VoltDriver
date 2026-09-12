const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_KEY_ENV = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export interface SupabasePublicEnvironment {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
}

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export class SupabaseConfigurationError extends Error {
  constructor(public readonly variable: string, message: string) {
    super(`${variable}: ${message}`);
    this.name = "SupabaseConfigurationError";
  }
}

function requireValue(value: string | undefined, variable: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new SupabaseConfigurationError(variable, "is required");
  }

  return normalizedValue;
}

function validateUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new SupabaseConfigurationError(SUPABASE_URL_ENV, "must be a valid URL");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new SupabaseConfigurationError(
      SUPABASE_URL_ENV,
      "must use http or https",
    );
  }
}

export function getSupabasePublicConfig(
  environment: SupabasePublicEnvironment = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
): SupabasePublicConfig {
  const url = requireValue(environment.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL_ENV);
  const publishableKey = requireValue(
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_KEY_ENV,
  );

  validateUrl(url);

  return { url, publishableKey };
}
