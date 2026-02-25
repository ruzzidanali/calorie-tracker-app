import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { getMealsByDateRange } from "../services/mealService";
import { COLORS, SIZES } from "../constants/theme";
import {
  containerStyles,
  cardStyles,
  textStyles,
} from "../styles/commonStyles";
import { StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;

const AnalyticsScreen = () => {
  const user = useStore((state) => state.user);
  const calorieGoal = useStore((state) => state.calorieGoal);

  const [weekData, setWeekData] = useState(null);
  const [macrosData, setMacrosData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    if (!user?.id) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      const { data: meals } = await getMealsByDateRange(
        user.id,
        startDate.toISOString(),
        endDate.toISOString(),
      );

      if (meals) {
        processWeekData(meals);
        processMacrosData(meals);
      } else {
        processWeekData([]);
        processMacrosData([]);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [user?.id]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const processWeekData = (meals) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    const dailyCalories = last7Days.map((date) => {
      const dayMeals = meals.filter((meal) => {
        const mealDate = new Date(meal.logged_at);
        return mealDate.toDateString() === date.toDateString();
      });
      return dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    });

    const labels = last7Days.map((date) =>
      date.toLocaleDateString("en-US", { weekday: "short" }),
    );

    setWeekData({
      labels,
      datasets: [{ data: dailyCalories.length > 0 ? dailyCalories : [0] }],
    });
  };

  const processMacrosData = (meals) => {
    const totalProtein = meals.reduce(
      (sum, meal) => sum + (meal.protein || 0),
      0,
    );
    const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);

    const total = totalProtein + totalCarbs + totalFats;

    if (total === 0) {
      setMacrosData([
        {
          name: "No data",
          population: 1,
          color: COLORS.border,
          legendFontColor: COLORS.textLight,
        },
      ]);
      return;
    }

    setMacrosData([
      {
        name: "Protein",
        population: totalProtein,
        color: "#4ECDC4",
        legendFontColor: COLORS.text,
      },
      {
        name: "Carbs",
        population: totalCarbs,
        color: "#FFE66D",
        legendFontColor: COLORS.text,
      },
      {
        name: "Fats",
        population: totalFats,
        color: "#FF6B6B",
        legendFontColor: COLORS.text,
      },
    ]);
  };

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: COLORS.primary },
  };

  if (loading) {
    return (
      <View style={containerStyles.centered}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  const values = weekData?.datasets?.[0]?.data || [];
  const nonZero = values.filter((v) => v > 0);
  const lowest = nonZero.length > 0 ? Math.min(...nonZero) : 0;

  return (
    <ScrollView
      style={containerStyles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={containerStyles.content}>
        <Text style={textStyles.heading}>Analytics</Text>

        {/* Weekly Calories Chart */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Last 7 Days Calories</Text>

          {weekData && (
            <LineChart
              data={weekData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}

          <View style={styles.goalLine}>
            <View style={styles.goalDot} />
            <Text style={styles.goalText}>Daily Goal: {calorieGoal} cal</Text>
          </View>
        </View>

        {/* Macros Breakdown */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>
            Macros Breakdown (Last 7 Days)
          </Text>
          {macrosData && (
            <PieChart
              data={macrosData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          )}
        </View>

        {/* Quick Stats */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Weekly Summary</Text>

          {weekData && (
            <>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Average Daily Calories:</Text>
                <Text style={styles.statValue}>
                  {Math.round(values.reduce((a, b) => a + b, 0) / 7)} cal
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Highest Day:</Text>
                <Text style={styles.statValue}>{Math.max(...values)} cal</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Lowest Day:</Text>
                <Text style={styles.statValue}>{lowest} cal</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chart: { marginVertical: 8, borderRadius: 16 },
  goalLine: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  goalDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  goalText: { fontSize: SIZES.small, color: COLORS.textLight },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: { fontSize: SIZES.medium, color: COLORS.textLight },
  statValue: { fontSize: SIZES.medium, color: COLORS.text, fontWeight: "600" },
});

export default AnalyticsScreen;
