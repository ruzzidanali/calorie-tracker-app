import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export const styles = StyleSheet.create({
  // Header styles
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  date: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.9,
  },

  // Calorie tracking styles
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  calorieNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  calorieGoal: {
    fontSize: 20,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  remainingText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: SIZES.medium,
  },

  // Meal header row (for title and clear button)
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.error,
    borderRadius: 6,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },

  // Meals list styles
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: SIZES.medium,
    paddingVertical: 20,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mealName: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
  mealCalories: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Meal info section
  mealInfo: {
    flex: 1,
  },
  mealMacros: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 4,
  },
  mealRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
});