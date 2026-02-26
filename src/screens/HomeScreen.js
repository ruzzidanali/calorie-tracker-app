import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/HomeScreenStyles";
import { cardStyles, containerStyles } from "../styles/commonStyles";
import { useStore } from "../store/useStore";
import { COLORS } from "../constants/theme";
import CustomDialog from "../components/CustomDialog";
import { deleteMeal as deleteMealFromDB, getTodayMeals } from "../services/mealService";
import EditMealDialog from "../components/EditMealDialog";
import { updateMeal as updateMealInDB } from "../services/mealService";
import GradientHeader from "../components/GradientHeader";
import AnimatedProgressBar from "../components/AnimatedProgressBar";

const HomeScreen = () => {
  const profile = useStore((state) => state.profile);
  const dailyCalories = useStore((state) => state.dailyCalories);
  const calorieGoal = useStore((state) => state.calorieGoal);
  const todayMeals = useStore((state) => state.todayMeals);

  const removeMeal = useStore((state) => state.removeMeal);
  const resetDailyCalories = useStore((state) => state.resetDailyCalories);
  const updateMeal = useStore((state) => state.updateMeal);
  const user = useStore((state) => state.user);
  const setTodayMeals = useStore((state) => state.setTodayMeals);

  const [deleteDialog, setDeleteDialog] = useState({ visible: false, meal: null });
  const [clearDialog, setClearDialog] = useState(false);
  const [editDialog, setEditDialog] = useState({ visible: false, meal: null });
  const [refreshing, setRefreshing] = useState(false);

  const remaining = calorieGoal - dailyCalories;
  const percentage = Math.min((dailyCalories / calorieGoal) * 100, 100);

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDeleteMeal = (meal) => {
    setDeleteDialog({ visible: true, meal });
  };

  const confirmDeleteMeal = async () => {
    if (!deleteDialog.meal) return;

    const { error } = await deleteMealFromDB(deleteDialog.meal.id);

    if (error) {
      console.error("Error deleting from database:", error);
      alert("Failed to delete meal: " + error);
      return;
    }

    console.log("Meal deleted from database successfully");
    removeMeal(deleteDialog.meal.id);

    setDeleteDialog({ visible: false, meal: null });
  };

  const handleClearAll = () => {
    setClearDialog(true);
  };

  const confirmClearAll = async () => {
    console.log("Clearing all meals...");

    for (const meal of todayMeals) {
      await deleteMealFromDB(meal.id);
    }

    console.log("All meals deleted from database");
    resetDailyCalories();

    setClearDialog(false);
  };

  const handleEditMeal = (meal) => {
    setEditDialog({ visible: true, meal });
  };

  const handleSaveEdit = async (updates) => {
    if (!editDialog.meal) return;

    console.log("Saving meal updates:", updates);

    const { error } = await updateMealInDB(editDialog.meal.id, updates);

    if (error) {
      console.error("Error updating meal:", error);
      alert("Failed to update meal: " + error);
      return;
    }

    console.log("Meal updated successfully");
    updateMeal(editDialog.meal.id, updates);

    setEditDialog({ visible: false, meal: null });
    alert("Meal updated successfully!");
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      const currentUser = useStore.getState().user;
      if (currentUser?.id) {
        const { data: mealsData, error } = await getTodayMeals(currentUser.id);
        if (error) throw new Error(error);

        if (mealsData) {
          setTodayMeals(mealsData);
        } else {
          setTodayMeals([]);
        }
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

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
      {/* Header */}
      <GradientHeader title={`Hello, ${profile.name || "User"}!`} subtitle={dateString} icon="logo" />

      {/* Calorie Card */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Today's Calories</Text>

        <View style={styles.calorieContainer}>
          <Text style={styles.calorieNumber}>{dailyCalories}</Text>
          <Text style={styles.calorieGoal}>/ {calorieGoal}</Text>
        </View>

        {/* Progress Bar */}
        <AnimatedProgressBar progress={percentage} />

        <Text style={styles.remainingText}>
          {remaining > 0 ? `${remaining} calories remaining` : `${Math.abs(remaining)} calories over goal`}
        </Text>
      </View>

      {/* Today's Meals */}
      <View style={cardStyles.card}>
        <View style={styles.mealHeaderRow}>
          <Text style={cardStyles.cardTitle}>Today's Meals ({todayMeals.length})</Text>

          {todayMeals.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {todayMeals.length === 0 ? (
          <Text style={styles.emptyText}>No meals logged yet</Text>
        ) : (
          todayMeals.map((meal, index) => (
            <View key={meal.id ?? `${meal.logged_at ?? ""}_${meal.name}_${index}`} style={styles.mealItem}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealMacros}>
                  {meal.protein > 0 && `P: ${meal.protein}g  `}
                  {meal.carbs > 0 && `C: ${meal.carbs}g  `}
                  {meal.fats > 0 && `F: ${meal.fats}g`}
                </Text>
              </View>

              <View style={styles.mealRight}>
                <Text style={styles.mealCalories}>{meal.calories} cal</Text>

                <TouchableOpacity onPress={() => handleEditMeal(meal)} style={styles.editButton}>
                  <Ionicons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteMeal(meal)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayMeals.length}</Text>
          <Text style={styles.statLabel}>Meals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {todayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Protein (g)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {todayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Carbs (g)</Text>
        </View>
      </View>

      {/* Delete Meal Dialog */}
      <CustomDialog
        visible={deleteDialog.visible}
        onClose={() => setDeleteDialog({ visible: false, meal: null })}
        title="Delete Meal"
        message={`Are you sure you want to delete "${deleteDialog.meal?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMeal}
        type="danger"
      />

      {/* Clear All Dialog */}
      <CustomDialog
        visible={clearDialog}
        onClose={() => setClearDialog(false)}
        title="Clear All Meals"
        message="Are you sure you want to clear all meals for today? All your progress will be reset."
        confirmText="Clear All"
        cancelText="Keep Meals"
        onConfirm={confirmClearAll}
        type="warning"
      />

      {/* Edit Meal Dialog */}
      <EditMealDialog
        visible={editDialog.visible}
        meal={editDialog.meal}
        onClose={() => setEditDialog({ visible: false, meal: null })}
        onSave={handleSaveEdit}
      />
    </ScrollView>
  );
};

export default HomeScreen;