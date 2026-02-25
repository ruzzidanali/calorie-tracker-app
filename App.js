import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import AppNavigation from "./src/navigation/AppNavigation";
import { supabase } from "./src/services/supabase";
import { useStore } from "./src/store/useStore";
import { getUserProfile, ensureUserProfile } from "./src/services/userService";
import { getTodayMeals } from "./src/services/mealService";
import { COLORS } from "./src/constants/theme";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setUser = useStore((state) => state.setUser);
  const setSession = useStore((state) => state.setSession);
  const setProfile = useStore((state) => state.setProfile);
  const setTodayMeals = useStore((state) => state.setTodayMeals);
  const setCalorieGoal = useStore((state) => state.setCalorieGoal);

  useEffect(() => {
    console.log("App starting...");

    const timeout = setTimeout(() => {
      console.log("TIMEOUT: Forcing loading to stop");
      setIsLoading(false);
    }, 5000);

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        console.log("Session:", session);

        if (event === "SIGNED_IN" && session?.user) {
          console.log("User signed in:", session.user.email);

          setSession(session);
          setUser(session.user);

          // ✅ Ensure profile row exists BEFORE loading user data
          const { error: ensureErr } = await ensureUserProfile(session.user);
          if (ensureErr) console.error("ensureUserProfile error:", ensureErr);

          await loadUserData(session.user.id);

          console.log("Setting loading to false after SIGNED_IN");
          setIsLoading(false);
          clearTimeout(timeout);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setUser(null);
          setSession(null);
          useStore.getState().clearStore();
          setIsLoading(false);
          clearTimeout(timeout);
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      console.log("Checking session...");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log("getSession result:", { session, error });

      if (error) {
        console.error("Session error:", error);
        setLoadingError(error.message);
        setIsLoading(false);
        return;
      }

      console.log("Session exists:", !!session);

      if (session?.user) {
        console.log("User from session:", session.user.email);
        setSession(session);
        setUser(session.user);

        // ✅ Ensure profile row exists BEFORE loading user data
        const { error: ensureErr } = await ensureUserProfile(session.user);
        if (ensureErr) console.error("ensureUserProfile error:", ensureErr);

        console.log("About to load user data...");
        await loadUserData(session.user.id);
        console.log("User data loaded, setting loading to false");
      } else {
        console.log("No session found, not authenticated");
      }

      console.log("checkSession complete, setting loading to false");
      setIsLoading(false);
    } catch (error) {
      console.error("Error in checkSession:", error);
      setLoadingError(error.message);
      setIsLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      console.log("=== LOADING USER DATA START ===");
      console.log("User ID:", userId);

      console.log("Fetching profile...");
      const { data: profileData, error: profileError } =
        await getUserProfile(userId);

      console.log("Profile response:", { profileData, profileError });

      if (profileError) {
        console.error("Profile error:", profileError);
      }

      if (profileData) {
        console.log("Setting profile data:", profileData);
        setProfile({
          name: profileData.name || "User",
          email: profileData.email || "",
          age: profileData.age,
          weight: profileData.weight,
          height: profileData.height,
        });
        setCalorieGoal(profileData.calorie_goal || 2000);
      } else {
        console.log("No profile found, using defaults");
        setProfile({
          name: "User",
          email: "",
          age: null,
          weight: null,
          height: null,
        });
      }

      console.log("Fetching meals...");
      const { data: mealsData, error: mealsError } = await getTodayMeals(userId);

      console.log("Meals response:", { mealsData, mealsError });

      if (mealsError) {
        console.error("Meals error:", mealsError);
      }

      if (mealsData && Array.isArray(mealsData)) {
        console.log("Setting meals:", mealsData.length, "meals");
        setTodayMeals(mealsData);
      }

      console.log("=== LOADING USER DATA COMPLETE ===");
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  console.log(
    "Rendering App, isLoading:",
    isLoading,
    "isAuthenticated:",
    isAuthenticated
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.debugText}>Check console for logs</Text>
        {loadingError && (
          <Text style={styles.errorText}>Error: {loadingError}</Text>
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigation isAuthenticated={isAuthenticated === true} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textLight,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.error,
    textAlign: "center",
    padding: 16,
  },
});