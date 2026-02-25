// Date formatting utilities
export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

export const formatDateTime = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

export const isToday = (date) => {
  const today = getTodayDate();
  const compareDate = new Date(date).toISOString().split('T')[0];
  return today === compareDate;
};

export const getWeekday = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(date).getDay()];
};

// Calorie calculation utilities
export const calculateTotalCalories = (meals) => {
  return meals.reduce((total, meal) => total + (meal.calories || 0), 0);
};

export const calculateTotalMacros = (meals) => {
  return meals.reduce((totals, meal) => ({
    protein: totals.protein + (meal.protein || 0),
    carbs: totals.carbs + (meal.carbs || 0),
    fats: totals.fats + (meal.fats || 0),
  }), { protein: 0, carbs: 0, fats: 0 });
};

export const getCalorieStatus = (current, goal) => {
  const percentage = (current / goal) * 100;
  
  if (percentage < 80) return { status: 'under', color: '#4CAF50' };
  if (percentage >= 80 && percentage <= 100) return { status: 'good', color: '#4CAF50' };
  if (percentage > 100 && percentage <= 110) return { status: 'near', color: '#FFC107' };
  return { status: 'over', color: '#F44336' };
};

export const getRemainingCalories = (current, goal) => {
  return Math.max(0, goal - current);
};

// BMI calculation
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
};

export const getBMICategory = (bmi) => {
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi >= 18.5 && bmi < 25) return 'Normal';
  if (bmi >= 25 && bmi < 30) return 'Overweight';
  return 'Obese';
};

// Recommended daily calorie intake (Harris-Benedict equation)
export const calculateDailyCalories = (weight, height, age, gender, activityLevel) => {
  let bmr;
  
  // Calculate BMR
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Heavy exercise 6-7 days/week
    veryActive: 1.9,     // Very heavy exercise, physical job
  };
  
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
};

// Format numbers
export const formatNumber = (num) => {
  return num.toLocaleString('en-US');
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};