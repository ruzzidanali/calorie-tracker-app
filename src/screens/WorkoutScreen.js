import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";
import {
  containerStyles,
  cardStyles,
  textStyles,
  buttonStyles,
  inputStyles,
} from "../styles/commonStyles";
import { useStore } from "../store/useStore";
import {
  saveWorkout,
  getTodayWorkouts,
  deleteWorkout as deleteWorkoutFromDB,
} from "../services/workoutService";
import CustomDialog from "../components/CustomDialog";

const WorkoutScreen = () => {
  const user = useStore((state) => state.user);
  const todayWorkouts = useStore((state) => state.todayWorkouts);
  const totalCaloriesBurned = useStore((state) => state.totalCaloriesBurned);
  const addWorkout = useStore((state) => state.addWorkout);
  const removeWorkout = useStore((state) => state.removeWorkout);
  const setTodayWorkouts = useStore((state) => state.setTodayWorkouts);

  const [showAddModal, setShowAddModal] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedType, setSelectedType] = useState("cardio");
  const [deleteDialog, setDeleteDialog] = useState({
    visible: false,
    workout: null,
  });

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    if (!user?.id) return;

    const { data } = await getTodayWorkouts(user.id);
    if (data) {
      setTodayWorkouts(data);
    }
  };

  const workoutCategories = [
    { name: "Cardio", icon: "bicycle", color: "#FF6B6B", type: "cardio" },
    { name: "Strength", icon: "barbell", color: "#4ECDC4", type: "strength" },
    { name: "Yoga", icon: "body", color: "#95E1D3", type: "yoga" },
    { name: "HIIT", icon: "flash", color: "#FFA07A", type: "hiit" },
  ];

  const handleAddWorkout = async () => {
    if (!workoutName.trim()) {
      alert("Please enter workout name");
      return;
    }
    if (!duration || isNaN(duration) || parseInt(duration) <= 0) {
      alert("Please enter valid duration");
      return;
    }
    if (
      !caloriesBurned ||
      isNaN(caloriesBurned) ||
      parseInt(caloriesBurned) < 0
    ) {
      alert("Please enter valid calories burned");
      return;
    }

    const newWorkout = {
      name: workoutName.trim(),
      duration: parseInt(duration),
      calories_burned: parseInt(caloriesBurned),
      workout_type: selectedType,
      notes: notes.trim(),
      completed_at: new Date().toISOString(),
    };

    // Save to database
    const { data, error } = await saveWorkout(user.id, newWorkout);

    if (error) {
      alert("Error saving workout: " + error);
      return;
    }

    console.log("Workout saved with ID:", data.id);

    // Add to store with the real ID from database
    addWorkout(data);

    // Reset form
    setWorkoutName("");
    setDuration("");
    setCaloriesBurned("");
    setNotes("");
    setSelectedType("cardio");
    setShowAddModal(false);

    alert("Workout logged successfully!");
  };

  const handleDeleteWorkout = (workout) => {
    setDeleteDialog({ visible: true, workout });
  };

  const confirmDeleteWorkout = async () => {
    if (!deleteDialog.workout) return;

    const { error } = await deleteWorkoutFromDB(deleteDialog.workout.id);

    if (error) {
      alert("Failed to delete workout: " + error);
      return;
    }

    removeWorkout(deleteDialog.workout.id);
    setDeleteDialog({ visible: false, workout: null });
  };

  return (
    <View style={containerStyles.container}>
      <ScrollView>
        <View style={containerStyles.content}>
          {/* Summary Card */}
          <View style={cardStyles.card}>
            <Text style={cardStyles.cardTitle}>Today's Activity</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{todayWorkouts.length}</Text>
                <Text style={styles.summaryLabel}>Workouts</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {todayWorkouts.reduce((sum, w) => sum + w.duration, 0)}
                </Text>
                <Text style={styles.summaryLabel}>Minutes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalCaloriesBurned}</Text>
                <Text style={styles.summaryLabel}>Calories</Text>
              </View>
            </View>
          </View>

          {/* Workout Categories */}
          <Text style={styles.heading}>Workout Types</Text>
          <View style={styles.categoriesGrid}>
            {workoutCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.color },
                ]}
                onPress={() => {
                  setSelectedType(category.type);
                  setShowAddModal(true);
                }}
              >
                <Ionicons name={category.icon} size={40} color={COLORS.white} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today's Workouts */}
          <View style={cardStyles.card}>
            <View style={styles.headerRow}>
              <Text style={cardStyles.cardTitle}>Today's Workouts</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {todayWorkouts.length === 0 ? (
              <Text style={textStyles.emptyText}>No workouts logged yet</Text>
            ) : (
              todayWorkouts.map((workout) => (
                <View key={workout.id} style={styles.workoutItem}>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutDetails}>
                      {workout.duration} min • {workout.calories_burned} cal
                      burned
                    </Text>
                    {workout.notes && (
                      <Text style={styles.workoutNotes}>{workout.notes}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteWorkout(workout)}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Workout Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Workout</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={inputStyles.label}>Workout Name *</Text>
              <TextInput
                style={inputStyles.input}
                placeholder="e.g., Morning Run"
                value={workoutName}
                onChangeText={setWorkoutName}
              />

              <Text style={inputStyles.label}>Type *</Text>
              <View style={styles.typeSelector}>
                {workoutCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.type}
                    style={[
                      styles.typeButton,
                      selectedType === cat.type && {
                        backgroundColor: cat.color,
                      },
                    ]}
                    onPress={() => setSelectedType(cat.type)}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        selectedType === cat.type && { color: COLORS.white },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={inputStyles.label}>Duration (minutes) *</Text>
              <TextInput
                style={inputStyles.input}
                placeholder="e.g., 30"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />

              <Text style={inputStyles.label}>Calories Burned *</Text>
              <TextInput
                style={inputStyles.input}
                placeholder="e.g., 250"
                value={caloriesBurned}
                onChangeText={setCaloriesBurned}
                keyboardType="numeric"
              />

              <Text style={inputStyles.label}>Notes (optional)</Text>
              <TextInput
                style={[inputStyles.input, styles.notesInput]}
                placeholder="Any additional notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={buttonStyles.primaryButton}
                onPress={handleAddWorkout}
              >
                <Text style={buttonStyles.buttonText}>Log Workout</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Dialog */}
      <CustomDialog
        visible={deleteDialog.visible}
        onClose={() => setDeleteDialog({ visible: false, workout: null })}
        title="Delete Workout"
        message={`Are you sure you want to delete "${deleteDialog.workout?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteWorkout}
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryName: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: "bold",
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    padding: 4,
  },
  workoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  workoutNotes: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: "600",
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
});

export default WorkoutScreen;
