import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseServiceRoleKey, isSupabaseEnvConfigured, validateEnvironment } from "@/lib/env";
import type { Database } from "@/lib/supabase.types";

validateEnvironment();

let browserClient: SupabaseClient<Database> | null = null;

export const isSupabaseConfigured = isSupabaseEnvConfigured();
export const hasServiceRoleKey = hasSupabaseServiceRoleKey();

export interface SupabaseQueryErrorLike {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
}

export function shouldFallbackToDemoData(error?: SupabaseQueryErrorLike | null) {
  if (!error) {
    return false;
  }

  if (error.code === "PGRST205" || error.code === "42P01" || error.code === "42703") {
    return true;
  }

  const message = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return (
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    (message.includes("relation") && message.includes("does not exist")) ||
    (message.includes("column") && message.includes("does not exist"))
  );
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured || typeof window === "undefined") {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });
  }

  return browserClient;
}

export function getSupabaseServerClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (!hasServiceRoleKey) {
    return null;
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getConfiguredSupabaseClient(preferAdmin = false): SupabaseClient<Database> | null {
  if (preferAdmin) {
    return getSupabaseAdminClient() ?? getSupabaseServerClient();
  }

  return getSupabaseServerClient();
}
