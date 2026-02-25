import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { getMealsByDateRange, deleteMeal as deleteMealFromDB } from '../services/mealService';
import { COLORS, SIZES } from '../constants/theme';
import { containerStyles, cardStyles, textStyles } from '../styles/commonStyles';
import { StyleSheet } from 'react-native';
import CustomDialog from '../components/CustomDialog';

const MealHistoryScreen = () => {
  const user = useStore((state) => state.user);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'all'
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, meal: null });

  useEffect(() => {
    loadMeals();
  }, [selectedPeriod]);

  const loadMeals = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      
      const { data, error } = await getMealsByDateRange(
        user.id,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (error) {
        console.error('Error loading meals:', error);
        alert('Failed to load meals');
      } else if (data) {
        setMeals(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'all':
        startDate.setFullYear(startDate.getFullYear() - 1); // Last year
        break;
    }

    return { startDate, endDate };
  };

  const groupMealsByDate = () => {
    const grouped = {};
    
    meals.forEach((meal) => {
      const date = new Date(meal.logged_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(meal);
    });

    return grouped;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const calculateDayTotal = (dayMeals) => {
    return dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  const handleDeleteMeal = (meal) => {
    setDeleteDialog({ visible: true, meal });
  };

  const confirmDeleteMeal = async () => {
    if (!deleteDialog.meal) return;

    const { error } = await deleteMealFromDB(deleteDialog.meal.id);

    if (error) {
      alert('Failed to delete meal: ' + error);
      return;
    }

    // Remove from local state
    setMeals(meals.filter((m) => m.id !== deleteDialog.meal.id));
    setDeleteDialog({ visible: false, meal: null });
  };

  const groupedMeals = groupMealsByDate();
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalMeals = meals.length;

  if (loading) {
    return (
      <View style={containerStyles.centered}>
        <Text>Loading meals...</Text>
      </View>
    );
  }

  return (
    <View style={containerStyles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('all')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'all' && styles.periodTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={containerStyles.content}>
          {/* Summary Card */}
          <View style={cardStyles.card}>
            <Text style={cardStyles.cardTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalMeals}</Text>
                <Text style={styles.summaryLabel}>Total Meals</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalCalories.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Total Calories</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0}
                </Text>
                <Text style={styles.summaryLabel}>Avg per Meal</Text>
              </View>
            </View>
          </View>

          {/* Meals by Date */}
          {Object.keys(groupedMeals).length === 0 ? (
            <View style={cardStyles.card}>
              <Text style={textStyles.emptyText}>No meals found for this period</Text>
            </View>
          ) : (
            Object.keys(groupedMeals)
              .sort((a, b) => new Date(b) - new Date(a))
              .map((dateString) => {
                const dayMeals = groupedMeals[dateString];
                const dayTotal = calculateDayTotal(dayMeals);

                return (
                  <View key={dateString} style={cardStyles.card}>
                    <View style={styles.dateHeader}>
                      <Text style={styles.dateText}>{formatDate(dateString)}</Text>
                      <Text style={styles.dateTotalText}>{dayTotal} cal</Text>
                    </View>

                    {dayMeals.map((meal) => (
                      <View key={meal.id} style={styles.mealItem}>
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealName}>{meal.name}</Text>
                          <Text style={styles.mealTime}>
                            {new Date(meal.logged_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                          {(meal.protein > 0 || meal.carbs > 0 || meal.fats > 0) && (
                            <Text style={styles.mealMacros}>
                              {meal.protein > 0 && `P: ${meal.protein}g  `}
                              {meal.carbs > 0 && `C: ${meal.carbs}g  `}
                              {meal.fats > 0 && `F: ${meal.fats}g`}
                            </Text>
                          )}
                        </View>
                        <View style={styles.mealRight}>
                          <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteMeal(meal)}
                            style={styles.deleteButton}
                          >
                            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>

      {/* Delete Dialog */}
      <CustomDialog
        visible={deleteDialog.visible}
        onClose={() => setDeleteDialog({ visible: false, meal: null })}
        title="Delete Meal"
        message={`Are you sure you want to delete "${deleteDialog.meal?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMeal}
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: '600',
  },
  periodTextActive: {
    color: COLORS.white,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  dateText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateTotalText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  mealTime: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  mealMacros: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  mealRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  mealCalories: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
});

export default MealHistoryScreen;