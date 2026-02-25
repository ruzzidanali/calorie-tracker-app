import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export const styles = StyleSheet.create({
  // Category grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },

  // Routine items
  routineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  routineDetails: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },

  // Workout stats
  workoutStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  workoutStatLabel: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  workoutStatValue: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: '600',
  },
});