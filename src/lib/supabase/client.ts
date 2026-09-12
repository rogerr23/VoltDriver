import "client-only";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "./env";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } = getSupabasePublicConfig();
  browserClient = createBrowserClient(url, publishableKey);

  return browserClient;
}
