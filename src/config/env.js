import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

export const ENV = {
  SUPABASE_URL: extra.supabaseUrl,
  SUPABASE_ANON_KEY: extra.supabaseAnonKey,
};

// Optional: fail fast so build doesn’t silently crash later
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.warn(
    "Missing Supabase env vars. Check EAS env + app.config.js (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY)."
  );
}