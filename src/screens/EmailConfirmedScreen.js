import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

export default function EmailConfirmedScreen({ navigation }) {
  useEffect(() => {
    // optional: auto go to login after 2s
    // const t = setTimeout(() => navigation.replace("Login"), 2000);
    // return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={90} color={COLORS.success || "#22c55e"} />
      <Text style={styles.title}>Email Confirmed</Text>
      <Text style={styles.subtitle}>
        Your email has been confirmed. You can login now.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});