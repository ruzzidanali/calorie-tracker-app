import { encode } from "base-64";
import { supabase } from "./supabase";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabaseConfig";

export const ensureUserProfile = async (user) => {
  try {
    if (!user?.id) return { data: null, error: "No user provided" };

    const name =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      null;

    const payload = {
      id: user.id,
      email: user.email ?? null,
      name,
      calorie_goal: 2000,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const checkEmailStatus = async (email) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
        },
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return { status: "not_registered" };
    }

    const { data: authData, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      return { status: "verified" };
    }
    return { status: "unverified" };
  } catch (err) {
    return { status: "error", message: err.message };
  }
};