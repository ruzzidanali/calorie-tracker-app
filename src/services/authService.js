import { supabase } from "./supabase";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseConfig";

export const signUp = async (email, password, name) => {
  try {
    const cleanEmail = String(email || "").trim().toLowerCase();
    console.log("Signing up user:", cleanEmail);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name },
        emailRedirectTo: "calorietracker://email-confirmed",
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    // ✅ Detect duplicate email (Supabase may return error=null but identities=[])
    if (data?.user?.identities?.length === 0) {
      return {
        data: null,
        error: "This email is already registered. Please log in instead.",
      };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Sign up error:", err);
    return { data: null, error: err.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const cleanEmail = String(email || "").trim().toLowerCase();
    console.log("Signing in user:", cleanEmail);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      const msg = String(error.message || "").toLowerCase();

      if (msg.includes("invalid login credentials")) {
        return { data: null, error: "Invalid email or password." };
      }

      if (msg.includes("email") && (msg.includes("confirm") || msg.includes("verified"))) {
        return { data: null, error: "Please verify your email first, then try logging in." };
      }

      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Sign in error:", err);
    return { data: null, error: err.message };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error("Sign out error:", err);
    return { error: err.message };
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("Get session error:", err);
    return { data: null, error: err.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return { user, error: null };
  } catch (err) {
    console.error("Get user error:", err);
    return { user: null, error: err.message };
  }
};

/**
 * ✅ FAST resend verification:
 * - NOT REGISTERED  -> profiles has no row
 * - VERIFIED        -> profiles.email_verified = true
 * - UNVERIFIED      -> profiles.email_verified = false -> resend
 *
 * Requires profiles table to have:
 * - email column
 * - email_verified boolean column (default false)
 */
export const resendConfirmationEmailSmart = async (email) => {
  try {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail) return { ok: false, message: "Please enter your email first." };

    // 1) FAST CHECK (direct DB REST call)
    const url =
      `${SUPABASE_URL}/rest/v1/profiles?` +
      `email=eq.${encodeURIComponent(cleanEmail)}` +
      `&select=email_verified`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });

    if (!res.ok) {
      const t = await res.text();
      return { ok: false, message: `Status check failed (${res.status}): ${t}` };
    }

    const rows = await res.json();

    // 3) Not registered
    if (!rows || rows.length === 0) {
      return { ok: false, message: "Email not registered yet." };
    }

    // 1) Verified
    if (rows[0]?.email_verified === true) {
      return { ok: false, message: "Email already verified. You can log in." };
    }

    // 2) Not verified → resend email
    const { error: resendErr } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
    });

    if (resendErr) return { ok: false, message: resendErr.message };

    return { ok: true, message: "Verification email has been sent." };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};