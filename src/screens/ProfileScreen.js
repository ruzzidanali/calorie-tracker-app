import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '../services/authService';
import { updateUserProfile } from '../services/userService';
import { useStore } from '../store/useStore';
import { COLORS, SIZES } from '../constants/theme';
import { styles } from '../styles/ProfileScreenStyles';
import { containerStyles, cardStyles, inputStyles, buttonStyles, avatarStyles } from '../styles/commonStyles';
import { calculateBMI, getBMICategory, calculateDailyCalories } from '../utils/helper';

const ProfileScreen = () => {
  const user = useStore((state) => state.user);
  const profile = useStore((state) => state.profile);
  const calorieGoal = useStore((state) => state.calorieGoal);
  const setCalorieGoal = useStore((state) => state.setCalorieGoal);
  const setProfile = useStore((state) => state.setProfile);
  const updateProfile = useStore((state) => state.updateProfile);
  const clearStore = useStore((state) => state.clearStore);
  const todayMeals = useStore((state) => state.todayMeals);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(calorieGoal.toString());
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile.name);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricsForm, setMetricsForm] = useState({
    weight: profile.weight?.toString() || '',
    height: profile.height?.toString() || '',
    age: profile.age?.toString() || '',
  });

  // Handle save calorie goal
  const handleSaveGoal = async () => {
    const goal = parseInt(newGoal);
    if (isNaN(goal) || goal < 1000 || goal > 5000) {
      alert('Please enter a calorie goal between 1000 and 5000');
      return;
    }

    // Save to database
    const { error } = await updateUserProfile(user.id, { calorie_goal: goal });
    
    if (error) {
      alert('Failed to update goal: ' + error);
      return;
    }

    setCalorieGoal(goal);
    setIsEditingGoal(false);
    alert('Calorie goal updated!');
  };

  const handleCancelGoal = () => {
    setIsEditingGoal(false);
    setNewGoal(calorieGoal.toString());
  };

  // Handle save name
  const handleSaveName = async () => {
    if (!newName.trim()) {
      alert('Please enter a valid name');
      return;
    }

    const { error } = await updateUserProfile(user.id, { name: newName.trim() });
    
    if (error) {
      alert('Failed to update name: ' + error);
      return;
    }

    updateProfile({ name: newName.trim() });
    setIsEditingName(false);
    alert('Name updated!');
  };

  const handleCancelName = () => {
    setIsEditingName(false);
    setNewName(profile.name);
  };

  // Handle save metrics
  const handleSaveMetrics = async () => {
    const weight = parseFloat(metricsForm.weight);
    const height = parseFloat(metricsForm.height);
    const age = parseInt(metricsForm.age);

    if (metricsForm.weight && (isNaN(weight) || weight < 20 || weight > 300)) {
      alert('Please enter a valid weight (20-300 kg)');
      return;
    }
    if (metricsForm.height && (isNaN(height) || height < 100 || height > 250)) {
      alert('Please enter a valid height (100-250 cm)');
      return;
    }
    if (metricsForm.age && (isNaN(age) || age < 10 || age > 120)) {
      alert('Please enter a valid age (10-120)');
      return;
    }

    const updates = {
      weight: weight || null,
      height: height || null,
      age: age || null,
    };

    const { error } = await updateUserProfile(user.id, updates);
    
    if (error) {
      alert('Failed to update metrics: ' + error);
      return;
    }

    updateProfile(updates);
    setShowMetricsModal(false);
    alert('Body metrics updated!');
  };

  const handleLogout = async () => {
  try {
    // Use Alert.alert instead of confirm for mobile
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('Logging out...');
            await signOut();
            clearStore();
            console.log('Logged out successfully');
          },
        },
      ],
      { cancelable: true }
    );
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to logout: ' + error.message);
  }
};

  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCategory = getBMICategory(bmi);

  return (
    <ScrollView style={containerStyles.container}>
      <View style={containerStyles.content}>
        {/* User Info Card */}
        <View style={cardStyles.card}>
          <View style={styles.profileHeader}>
            <View style={avatarStyles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.white} />
            </View>
            <View style={styles.userInfo}>
              {isEditingName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.goalInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Enter your name"
                  />
                  <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                    <Ionicons name="checkmark" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelName} style={styles.cancelButton}>
                    <Ionicons name="close" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.goalValue}>
                  <View>
                    <Text style={styles.userName}>{profile.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{profile.email || user?.email}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsEditingName(true)}>
                    <Ionicons name="pencil" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* User Stats */}
          {(profile.weight || profile.height || bmi) && (
            <View style={styles.statsRow}>
              {profile.weight && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.weight}</Text>
                  <Text style={styles.statLabel}>Weight (kg)</Text>
                </View>
              )}
              {profile.height && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.height}</Text>
                  <Text style={styles.statLabel}>Height (cm)</Text>
                </View>
              )}
              {bmi && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{bmi}</Text>
                  <Text style={styles.statLabel}>BMI ({bmiCategory})</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Daily Goals Card */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Daily Goals</Text>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Calorie Target</Text>
            {isEditingGoal ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.goalInput}
                  value={newGoal}
                  onChangeText={setNewGoal}
                  keyboardType="numeric"
                  placeholder="Enter calorie goal"
                />
                <TouchableOpacity onPress={handleSaveGoal} style={styles.saveButton}>
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelGoal} style={styles.cancelButton}>
                  <Ionicons name="close" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.goalValue}>
                <Text style={styles.goalNumber}>{calorieGoal} cal</Text>
                <TouchableOpacity onPress={() => setIsEditingGoal(true)}>
                  <Ionicons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Progress Summary Card */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Today's Summary</Text>

          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatLabel}>Meals Logged</Text>
            <Text style={styles.workoutStatValue}>{todayMeals.length}</Text>
          </View>

          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatLabel}>Total Calories</Text>
            <Text style={styles.workoutStatValue}>
              {todayMeals.reduce((sum, meal) => sum + meal.calories, 0)} cal
            </Text>
          </View>

          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatLabel}>Protein</Text>
            <Text style={styles.workoutStatValue}>
              {todayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0)} g
            </Text>
          </View>

          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatLabel}>Carbs</Text>
            <Text style={styles.workoutStatValue}>
              {todayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)} g
            </Text>
          </View>

          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatLabel}>Fats</Text>
            <Text style={styles.workoutStatValue}>
              {todayMeals.reduce((sum, meal) => sum + (meal.fats || 0), 0)} g
            </Text>
          </View>
        </View>

        {/* Settings Card */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowMetricsModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="body-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Body Metrics</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => alert('Notification settings coming soon!')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => alert('Units preferences coming soon!')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="scale-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Units (Metric/Imperial)</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => alert('Help & Support coming soon!')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      {/* Body Metrics Modal */}
      <Modal
        visible={showMetricsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMetricsModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <View style={localStyles.modalHeader}>
              <Text style={localStyles.modalTitle}>Body Metrics</Text>
              <TouchableOpacity onPress={() => setShowMetricsModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={inputStyles.label}>Weight (kg)</Text>
              <TextInput
                style={inputStyles.input}
                placeholder="e.g., 70"
                value={metricsForm.weight}
                onChangeText={(text) => setMetricsForm({ ...metricsForm, weight: text })}
                keyboardType="numeric"
              />

              <Text style={inputStyles.label}>Height (cm)</Text>
              <TextInput
                style={inputStyles.input}
                placeholder="e.g., 175"
                value={metricsForm.height}
                onChangeText={(text) => setMetricsForm({ ...metricsForm, height: text })}
                keyboardType="numeric"
              />

              <Text style={inputStyles.label}>Age</Text>
              <TextInput
                style={inputStyles.input}
                placeholder="e.g., 25"
                value={metricsForm.age}
                onChangeText={(text) => setMetricsForm({ ...metricsForm, age: text })}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={buttonStyles.primaryButton}
                onPress={handleSaveMetrics}
              >
                <Text style={buttonStyles.buttonText}>Save Metrics</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default ProfileScreen;