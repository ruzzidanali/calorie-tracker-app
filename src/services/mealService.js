import { supabase } from './supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';
import { useStore } from '../store/useStore';

// Helper function to get auth token - get it from the store instead
const getAuthToken = () => {
  const session = useStore.getState().session;
  return session?.access_token || SUPABASE_ANON_KEY;
};

export const saveMeal = async (userId, meal) => {
  console.log('>>> saveMeal ENTERED');
  try {
    console.log('>>> Building meal data...');
    const mealData = {
      user_id: userId,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
      meal_type: meal.meal_type || 'other',
      logged_at: meal.timestamp || new Date().toISOString(),
    };
    
    console.log('>>> Meal data built:', mealData);
    console.log('>>> Getting auth token...');
    
    const token = getAuthToken();  // No await needed now!
    
    console.log('>>> Token received:', token ? 'YES' : 'NO');
    console.log('>>> Token length:', token?.length);
    console.log('>>> About to fetch...');
    console.log('>>> URL:', `${SUPABASE_URL}/rest/v1/meals`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(mealData)
    });

    console.log('>>> Fetch completed!');
    console.log('>>> Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('>>> Response error:', errorText);
      throw new Error(errorText);
    }

    console.log('>>> Response OK, parsing JSON...');
    const data = await response.json();
    console.log('>>> Data received:', data);
    
    return { data, error: null };
  } catch (error) {
    console.error('>>> CATCH ERROR:', error);
    return { data: null, error: error.message };
  }
};

// Update getTodayMeals too
export const getTodayMeals = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const token = getAuthToken();  // No await

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/meals?user_id=eq.${userId}&logged_at=gte.${today.toISOString()}&order=logged_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(errorText);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Update deleteMeal too
export const deleteMeal = async (mealId) => {
  try {
    const token = getAuthToken();  // No await

    const response = await fetch(`${SUPABASE_URL}/rest/v1/meals?id=eq.${mealId}`, {
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
    return { error: error.message };
  }
};

export const updateMeal = async (mealId, updates) => {
  try {
    console.log('Updating meal:', mealId, updates);
    const token = getAuthToken();

    const response = await fetch (`${SUPABASE_URL}/rest/v1/meals?id=eq.${mealId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update error:', errorText);
      throw new Error(errorText);
    }
    
    const data = await response.json();
    console.log('Meal updated:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error updating meal:', error);
    return { data: null, error: error.message };
  }
};

// Update getMealsByDateRange too
export const getMealsByDateRange = async (userId, startDate, endDate) => {
  try {
    const token = getAuthToken();  // No await

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/meals?user_id=eq.${userId}&logged_at=gte.${startDate}&logged_at=lte.${endDate}&order=logged_at.desc`,
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
    return { data: null, error: error.message };
  }
};