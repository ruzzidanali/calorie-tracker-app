import { create } from "zustand";

export const useStore = create((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,

  profile: {
    name: "",
    email: "",
    age: null,
    weight: null,
    height: null,
  },

  dailyCalories: 0,
  calorieGoal: 2000,
  todayMeals: [],

  todayWorkouts: [],
  totalCaloriesBurned: 0,

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  setCalorieGoal: (goal) => set({ calorieGoal: goal }),

  setTodayMeals: (meals) =>
    set({
      todayMeals: meals,
      dailyCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
    }),

  addMeal: (meal) =>
    set((state) => ({
      todayMeals: [...state.todayMeals, meal],
      dailyCalories: state.dailyCalories + meal.calories,
    })),

  removeMeal: (mealId) =>
    set((state) => {
      const meal = state.todayMeals.find((m) => m.id === mealId);
      return {
        todayMeals: state.todayMeals.filter((m) => m.id !== mealId),
        dailyCalories: state.dailyCalories - (meal?.calories || 0),
      };
    }),

  updateMeal: (mealId, updates) =>
    set((state) => {
      const mealIndex = state.todayMeals.findIndex((m) => m.id === mealId);
      if (mealIndex === -1) return state;

      const oldMeal = state.todayMeals[mealIndex];
      const updatedMeal = { ...oldMeal, ...updates };
      const newMeals = [...state.todayMeals];
      newMeals[mealIndex] = updatedMeal;

      const newTotal = newMeals.reduce((sum, meal) => sum + meal.calories, 0);

      return {
        todayMeals: newMeals,
        dailyCalories: newTotal,
      };
    }),

  setTodayWorkouts: (workouts) =>
    set({
      todayWorkouts: workouts,
      totalCaloriesBurned: workouts.reduce(
        (sum, w) => sum + (w.calories_burned || 0),
        0,
      ),
    }),

  addWorkout: (workout) =>
    set((state) => ({
      todayWorkouts: [...state.todayWorkouts, workout],
      totalCaloriesBurned:
        state.totalCaloriesBurned + (workout.calories_burned || 0),
    })),

  removeWorkout: (workoutId) =>
    set((state) => {
      const workout = state.todayWorkouts.find((w) => w.id === workoutId);
      return {
        todayWorkouts: state.todayWorkouts.filter((w) => w.id !== workoutId),
        totalCaloriesBurned:
          state.totalCaloriesBurned - (workout?.calories_burned || 0),
      };
    }),

  resetDailyCalories: () => set({ dailyCalories: 0, todayMeals: [] }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  clearStore: () =>
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      profile: {
        name: "",
        email: "",
        age: null,
        weight: null,
        height: null,
      },
      dailyCalories: 0,
      todayMeals: [],
      todayWorkouts: [],
      totalCaloriesBurned: 0,
    }),
}));
