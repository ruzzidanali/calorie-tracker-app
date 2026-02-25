import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export const styles = StyleSheet.create({
  // Profile header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },

  // Goals section
  goalItem: {
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  goalValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalNumber: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    fontSize: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },

  // Settings list
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginLeft: 12,
  },

  // Logout button
  logoutButton: {
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Version info
  version: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: SIZES.small,
    marginTop: 20,
    marginBottom: 40,
  },

  // Stats in profile
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  workoutStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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