import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const GradientHeader = ({ title, subtitle, icon }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.gradientBackground}>
        <View style={styles.content}>
          {icon && (
            <View style={styles.iconContainer}>
              {icon === "logo" ? (
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.logo}
                />
              ) : (
                <Ionicons name={icon} size={50} color="white" />
              )}
              {/* <Ionicons name={icon} size={40} color={COLORS.white} /> */}
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 16,
  },
  gradientBackground: {
    backgroundColor: COLORS.primary,
    padding: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.9,
  },
  logo: {
    // resizeMode: "contain",
    width: 65,
    height: 65,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 20,
  },
});

export default GradientHeader;
