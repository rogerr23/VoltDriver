"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  type AuthActionState,
  getAuthCallbackUrl,
  parseSignInFormData,
  parseSignUpFormData,
} from "@/modules/auth/domain/forms";

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = parseSignInFormData(formData);

  if (!result.success) {
    return { status: "error", fieldErrors: result.fieldErrors };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return {
      status: "error",
      message: "E-mail ou senha inválidos.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = parseSignUpFormData(formData);

  if (!result.success) {
    return { status: "error", fieldErrors: result.fieldErrors };
  }

  const requestHeaders = await headers();
  const emailRedirectTo = getAuthCallbackUrl(requestHeaders.get("origin"));
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: { display_name: result.data.displayName },
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível criar a conta. Verifique os dados e tente novamente.",
    };
  }

  if (!data.session) {
    return {
      status: "confirmation-required",
      message: "Confira seu e-mail para confirmar a conta.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
