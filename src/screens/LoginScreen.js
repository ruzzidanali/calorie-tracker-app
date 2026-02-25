import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signIn, resendConfirmationEmailSmart } from "../services/authService";
import { COLORS } from "../constants/theme";
import { StyleSheet } from "react-native";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [lastSentAt, setLastSentAt] = useState(null);

  useEffect(() => {
    if (cooldownLeft <= 0) return;

    const t = setInterval(() => {
      setCooldownLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(t);
  }, [cooldownLeft]);

  const handleLogin = async () => {
    setError("");

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();
    if (!cleanEmail || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn(cleanEmail, password);
    setLoading(false);

    if (signInError) {
      const msg = String(signInError || "").toLowerCase();
      if (msg.includes("verify") || msg.includes("confirm")) {
        setError(
          "Please verify your email first. You can resend the verification email below.",
        );
      } else {
        setError(signInError);
      }
    }
  };

  const handleResendEmail = async () => {
    setError("");

    if (cooldownLeft > 0) {
      setError(`Please wait ${cooldownLeft}s before resending.`);
      return;
    }

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email first.");
      return;
    }

    setResending(true);
    const result = await resendConfirmationEmailSmart(cleanEmail);
    setResending(false);

    if (!result.ok) {
      // If rate-limited, apply longer cooldown
      if (String(result.message).toLowerCase().includes("rate limit")) {
        setCooldownLeft(120); // 2 minutes
      }
      setError(result.message);
      return;
    }

    setLastSentAt(Date.now());
    setCooldownLeft(60); // 60s cooldown after a successful send
    Alert.alert("Success", result.message);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="nutrition" size={60} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Calorie Tracker</Text>
          <Text style={styles.subtitle}>
            Track your nutrition, achieve your goals
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtext}>Sign in to continue</Text>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={COLORS.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Resend Verification */}
          <TouchableOpacity
            style={[
              styles.resendButton,
              (resending || cooldownLeft > 0) && styles.loginButtonDisabled,
            ]}
            onPress={handleResendEmail}
            disabled={resending || cooldownLeft > 0}
          >
            {resending ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.resendButtonText}>
                {cooldownLeft > 0
                  ? `Resend in ${cooldownLeft}s`
                  : "Resend verification email"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Track • Analyze • Achieve</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scrollContent: { flexGrow: 1 },
  header: { alignItems: "center", paddingTop: 60, paddingBottom: 40 },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: COLORS.white, opacity: 0.9 },
  formCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  welcomeSubtext: { fontSize: 16, color: COLORS.textLight, marginBottom: 30 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: { color: COLORS.error, fontSize: 14, marginLeft: 8, flex: 1 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: COLORS.text },
  eyeIcon: { padding: 8 },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resendButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 20,
  },
  resendButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 16, color: COLORS.textLight, fontSize: 14 },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: { color: COLORS.textLight, fontSize: 16 },
  signupLink: { color: COLORS.primary, fontSize: 16, fontWeight: "bold" },
  footer: {
    textAlign: "center",
    color: COLORS.white,
    fontSize: 14,
    paddingVertical: 20,
    opacity: 0.8,
  },
});

export default LoginScreen;
