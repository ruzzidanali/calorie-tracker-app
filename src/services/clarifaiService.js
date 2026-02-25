// FREE Food Recognition Service
// Uses: Open Food Facts API (100% free, no API key needed)

// Get nutrition data from Open Food Facts (FREE)
export const getNutritionData = async (foodName) => {
  try {
    console.log('🔍 Searching Open Food Facts for:', foodName);
    
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1&page_size=5`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch nutrition data');
    }

    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      // Return multiple options for user to choose
      const results = data.products.map(product => {
        const nutriments = product.nutriments || {};
        
        return {
          name: product.product_name || foodName,
          brand: product.brands || '',
          calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
          protein: Math.round(nutriments.proteins_100g || nutriments.proteins || 0),
          carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0),
          fats: Math.round(nutriments.fat_100g || nutriments.fat || 0),
          serving: '100g',
          image: product.image_url || null,
        };
      }).filter(item => item.calories > 0); // Only return items with calorie data

      return {
        data: results,
        error: null,
      };
    }

    return { data: [], error: 'No nutrition data found' };
  } catch (error) {
    console.error('❌ Open Food Facts error:', error);
    return { data: [], error: error.message };
  }
};

// Search for common foods (FREE database - works offline)
export const searchCommonFoods = (query) => {
  // Common food database with approximate nutritional values per 100g
  const commonFoods = [
    // Proteins
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'protein' },
    { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 13, category: 'protein' },
    { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fats: 11, category: 'protein' },
    { name: 'Beef', calories: 250, protein: 26, carbs: 0, fats: 17, category: 'protein' },
    { name: 'Tuna', calories: 132, protein: 28, carbs: 0, fats: 1.3, category: 'protein' },
    { name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fats: 4.8, category: 'protein' },
    
    // Carbs
    { name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, category: 'carbs' },
    { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, category: 'carbs' },
    { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fats: 1.1, category: 'carbs' },
    { name: 'Bread', calories: 265, protein: 9, carbs: 49, fats: 3.2, category: 'carbs' },
    { name: 'Potato', calories: 77, protein: 2, carbs: 17, fats: 0.1, category: 'carbs' },
    { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, category: 'carbs' },
    { name: 'Oats', calories: 389, protein: 17, carbs: 66, fats: 7, category: 'carbs' },
    
    // Vegetables
    { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, category: 'vegetables' },
    { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, category: 'vegetables' },
    { name: 'Carrots', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, category: 'vegetables' },
    { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, category: 'vegetables' },
    { name: 'Lettuce', calories: 15, protein: 1.4, carbs: 2.9, fats: 0.2, category: 'vegetables' },
    { name: 'Cucumber', calories: 16, protein: 0.7, carbs: 3.6, fats: 0.1, category: 'vegetables' },
    
    // Fruits
    { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, category: 'fruits' },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, category: 'fruits' },
    { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, category: 'fruits' },
    { name: 'Strawberry', calories: 32, protein: 0.7, carbs: 8, fats: 0.3, category: 'fruits' },
    { name: 'Grapes', calories: 69, protein: 0.7, carbs: 18, fats: 0.2, category: 'fruits' },
    { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 8, fats: 0.2, category: 'fruits' },
    { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fats: 0.4, category: 'fruits' },
    
    // Dairy
    { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fats: 1, category: 'dairy' },
    { name: 'Cheese', calories: 402, protein: 25, carbs: 1.3, fats: 33, category: 'dairy' },
    { name: 'Yogurt', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, category: 'dairy' },
    { name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fats: 81, category: 'dairy' },
    
    // Fast Food & Snacks
    { name: 'Pizza', calories: 266, protein: 11, carbs: 33, fats: 10, category: 'snacks' },
    { name: 'Burger', calories: 295, protein: 17, carbs: 24, fats: 14, category: 'snacks' },
    { name: 'French Fries', calories: 312, protein: 3.4, carbs: 41, fats: 15, category: 'snacks' },
    { name: 'Chocolate', calories: 546, protein: 5, carbs: 61, fats: 31, category: 'snacks' },
    { name: 'Ice Cream', calories: 207, protein: 3.5, carbs: 24, fats: 11, category: 'snacks' },
    { name: 'Cookies', calories: 502, protein: 5.9, carbs: 64, fats: 25, category: 'snacks' },
    
    // Nuts
    { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, category: 'nuts' },
    { name: 'Peanuts', calories: 567, protein: 26, carbs: 16, fats: 49, category: 'nuts' },
    { name: 'Cashews', calories: 553, protein: 18, carbs: 30, fats: 44, category: 'nuts' },
  ];

  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  const results = commonFoods.filter(food => 
    food.name.toLowerCase().includes(lowerQuery)
  );

  return results;
};