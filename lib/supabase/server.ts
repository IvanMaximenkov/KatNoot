import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type NextCookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase server client is not configured.");
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: NextCookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: NextCookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      }
    }
  });
}
