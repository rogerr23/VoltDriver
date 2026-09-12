export type AuthField = "displayName" | "email" | "password";

export type AuthFieldErrors = Partial<Record<AuthField, string[]>>;

export type AuthActionState =
  | { status: "idle" }
  | { status: "error"; message?: string; fieldErrors?: AuthFieldErrors }
  | { status: "confirmation-required"; message: string };

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  displayName: string;
}

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; fieldErrors: AuthFieldErrors };

function getText(formData: FormData, field: AuthField) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseSignInFormData(
  formData: FormData,
): ValidationResult<SignInCredentials> {
  const email = normalizeEmail(getText(formData, "email"));
  const password = getText(formData, "password");
  const fieldErrors: AuthFieldErrors = {};

  if (!email || email.length > 254 || !isEmail(email)) {
    fieldErrors.email = ["Informe um e-mail válido."];
  }

  if (!password) {
    fieldErrors.password = ["Informe sua senha."];
  } else if (password.length > 128) {
    fieldErrors.password = ["A senha deve ter no máximo 128 caracteres."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return { success: true, data: { email, password } };
}

export function parseSignUpFormData(
  formData: FormData,
): ValidationResult<SignUpCredentials> {
  const signInResult = parseSignInFormData(formData);
  const displayName = getText(formData, "displayName").trim();
  const fieldErrors: AuthFieldErrors = signInResult.success
    ? {}
    : { ...signInResult.fieldErrors };

  if (displayName.length < 2 || displayName.length > 80) {
    fieldErrors.displayName = ["Informe um nome entre 2 e 80 caracteres."];
  }

  const password = getText(formData, "password");

  if (password.length < 8) {
    fieldErrors.password = ["A senha deve ter pelo menos 8 caracteres."];
  } else if (password.length > 128) {
    fieldErrors.password = ["A senha deve ter no máximo 128 caracteres."];
  }

  if (Object.keys(fieldErrors).length > 0 || !signInResult.success) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: { ...signInResult.data, displayName },
  };
}

export function getSafeRedirectPath(value: string | null, fallback = "/") {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  const baseUrl = new URL("https://voltdriver.local");
  const destination = new URL(value, baseUrl);

  if (destination.origin !== baseUrl.origin) {
    return fallback;
  }

  return `${destination.pathname}${destination.search}`;
}

export function getAuthCallbackUrl(origin: string | null) {
  if (!origin) {
    return undefined;
  }

  try {
    const originUrl = new URL(origin);

    if (originUrl.protocol !== "http:" && originUrl.protocol !== "https:") {
      return undefined;
    }

    return new URL("/auth/callback", originUrl.origin).toString();
  } catch {
    return undefined;
  }
}
