import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';
import { useStore } from '../store/useStore';

// Helper function to get auth token
const getAuthToken = () => {
  const session = useStore.getState().session;
  return session?.access_token || SUPABASE_ANON_KEY;
};

// Save workout to database
export const saveWorkout = async (userId, workout) => {
  try {
    console.log('Saving workout:', workout);
    const token = getAuthToken();

    // Don't send the id - let Supabase generate it
    const workoutData = {
      user_id: userId,
      name: workout.name,
      duration: workout.duration,
      calories_burned: workout.calories_burned,
      workout_type: workout.workout_type || 'other',
      notes: workout.notes || '',
      completed_at: workout.completed_at || new Date().toISOString(),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(workoutData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(errorText);
    }

    const data = await response.json();
    console.log('Workout saved:', data);
    
    // Return the workout with the real ID from database
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error saving workout:', error);
    return { data: null, error: error.message };
  }
};

// Get today's workouts
export const getTodayWorkouts = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const token = getAuthToken();

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/workouts?user_id=eq.${userId}&completed_at=gte.${today.toISOString()}&order=completed_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return { data: null, error: error.message };
  }
};

// Delete workout
export const deleteWorkout = async (workoutId) => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${SUPABASE_URL}/rest/v1/workouts?id=eq.${workoutId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting workout:', error);
    return { error: error.message };
  }
};

// Get workouts by date range
export const getWorkoutsByDateRange = async (userId, startDate, endDate) => {
  try {
    const token = getAuthToken();

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/workouts?user_id=eq.${userId}&completed_at=gte.${startDate}&completed_at=lte.${endDate}&order=completed_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return { data: null, error: error.message };
  }
};