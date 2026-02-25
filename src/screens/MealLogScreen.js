import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/MealLogScreenStyles";
import { containerStyles, cardStyles, buttonStyles, inputStyles } from "../styles/commonStyles";
import { useStore } from "../store/useStore";
import { COLORS } from "../constants/theme";
import { saveMeal } from "../services/mealService";
import { takePhoto, pickImage } from "../services/imageService";
import { getNutritionData, searchCommonFoods } from "../services/clarifaiService";
import { recognizeFood, getFoodNutrition } from "../services/imageRecognitionService";
import FoodSelectionDialog from "../components/FoodSelectionDialog";
import * as Haptics from "expo-haptics";

const MealLogScreen = () => {
  const addMeal = useStore((state) => state.addMeal);
  const user = useStore((state) => state.user);

  // Form state
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Food search state
  const [searchResults, setSearchResults] = useState([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Image recognition state
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedFoods, setRecognizedFoods] = useState([]);
  const [showRecognizedDialog, setShowRecognizedDialog] = useState(false);

  // ============= METHOD 1: TAKE/CHOOSE PHOTO (AI) =============
  const handleTakePhoto = async () => {
    const photo = await takePhoto();
    if (photo) {
      console.log("Photo taken:", photo);
      setSelectedImage(photo.uri);
      await analyzeImage(photo.uri);
    }
  };

  const handleChoosePhoto = async () => {
    const image = await pickImage();
    if (image) {
      console.log("Image selected:", image);
      setSelectedImage(image.uri);
      await analyzeImage(image.uri);
    }
  };

  const analyzeImage = async (imageUri) => {
    setRecognizing(true);

    const { foods, error } = await recognizeFood(imageUri);

    setRecognizing(false);

    if (error) {
      alert("Failed to analyze image: " + error);
      return;
    }

    if (foods.length === 0) {
      alert("No food detected. Please search or add manually.");
      return;
    }

    console.log("Detected foods:", foods);
    setRecognizedFoods(foods);
    setShowRecognizedDialog(true);
  };

  const handleSelectRecognizedFood = async (food) => {
    console.log("Selected:", food.name);
    setShowRecognizedDialog(false);

    setMealName(food.name);

    // quick nutrition first
    const commonResults = searchCommonFoods(food.name);
    if (commonResults.length > 0) {
      const quick = commonResults[0];
      setCalories(String(quick.calories ?? ""));
      setProtein(String(quick.protein ?? ""));
      setCarbs(String(quick.carbs ?? ""));
      setFats(String(quick.fats ?? ""));
    } else {
      setCalories("150");
      setProtein("5");
      setCarbs("20");
      setFats("5");
    }

    Haptics.selectionAsync();

    setIsSearching(true);
    try {
      const { data: nutritionData } = await getFoodNutrition(food.name);
      if (nutritionData) {
        setCalories(String(nutritionData.calories ?? ""));
        setProtein(String(nutritionData.protein ?? ""));
        setCarbs(String(nutritionData.carbs ?? ""));
        setFats(String(nutritionData.fats ?? ""));
      }
    } finally {
      setIsSearching(false);
    }
  };

  // ============= METHOD 2: SEARCH DATABASE =============
  const handleSearchFood = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    const commonResults = searchCommonFoods(searchQuery);
    setSearchResults(commonResults);

    const { data: onlineResults } = await getNutritionData(searchQuery);

    const allResults = [...commonResults];
    if (onlineResults && onlineResults.length > 0) {
      onlineResults.forEach((online) => {
        if (!allResults.find((r) => r.name.toLowerCase() === online.name.toLowerCase())) {
          allResults.push(online);
        }
      });
    }

    setSearchResults(allResults);
    setIsSearching(false);
  };

  const handleSelectFood = (food) => {
    console.log("Selected from search:", food);
    setMealName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein?.toString() || "");
    setCarbs(food.carbs?.toString() || "");
    setFats(food.fats?.toString() || "");
    setShowFoodSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);

    if (text.length >= 3) {
      const commonResults = searchCommonFoods(text);
      setSearchResults(commonResults);
    } else {
      setSearchResults([]);
    }
  };

  // ============= METHOD 3: ADD MEAL (SAVES + STORE) =============
  const handleAddMeal = async () => {
    if (!user?.id) {
      alert("Please login first.");
      return;
    }

    if (!mealName.trim()) {
      alert("Please enter a meal name");
      return;
    }
    if (!calories || isNaN(calories) || parseInt(calories) <= 0) {
      alert("Please enter valid calories");
      return;
    }

    const newMeal = {
      name: mealName.trim(),
      calories: parseInt(calories),
      protein: protein ? parseInt(protein) : 0,
      carbs: carbs ? parseInt(carbs) : 0,
      fats: fats ? parseInt(fats) : 0,
      logged_at: new Date().toISOString(),
      meal_type: "other",
      image_url: selectedImage || null,
    };

    const { data: savedRows, error } = await saveMeal(user.id, newMeal);

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("Error saving meal: " + error);
      return;
    }

    const savedMeal = Array.isArray(savedRows) ? savedRows[0] : savedRows;
    addMeal(savedMeal || newMeal);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    alert(`${mealName} logged successfully!`);

    setMealName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setSelectedImage(null);
  };

  return (
    <ScrollView style={containerStyles.container}>
      <View style={containerStyles.content}>
        {/* ========== METHOD 1: IMAGE RECOGNITION ========== */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Scan Food with AI</Text>

          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImage(null)}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}

          {recognizing && (
            <View style={styles.recognizingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.recognizingText}>Analyzing image...</Text>
            </View>
          )}

          <View style={styles.cameraButtonsRow}>
            <TouchableOpacity style={[styles.cameraButton, styles.halfButton]} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={30} color={COLORS.white} />
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cameraButton, styles.halfButton]} onPress={handleChoosePhoto}>
              <Ionicons name="images" size={30} color={COLORS.white} />
              <Text style={styles.cameraButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.orText}>OR</Text>

        {/* ========== METHOD 2: SEARCH DATABASE ========== */}
        <TouchableOpacity
          style={[styles.cameraButton, { backgroundColor: COLORS.secondary, marginBottom: 16 }]}
          onPress={() => setShowFoodSearch(true)}
        >
          <Ionicons name="search" size={30} color={COLORS.white} />
          <Text style={styles.cameraButtonText}>Search Food Database</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        {/* ========== METHOD 3: MANUAL ENTRY ========== */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Enter Manually</Text>

          <Text style={inputStyles.label}>Meal Name *</Text>
          <TextInput style={inputStyles.input} placeholder="e.g., Grilled Chicken" value={mealName} onChangeText={setMealName} />

          <Text style={inputStyles.label}>Calories *</Text>
          <TextInput
            style={inputStyles.input}
            placeholder="e.g., 300"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />

          <Text style={styles.macrosLabel}>Macros (Optional)</Text>
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <Text style={inputStyles.label}>Protein (g)</Text>
              <TextInput style={inputStyles.input} placeholder="0" value={protein} onChangeText={setProtein} keyboardType="numeric" />
            </View>

            <View style={styles.macroItem}>
              <Text style={inputStyles.label}>Carbs (g)</Text>
              <TextInput style={inputStyles.input} placeholder="0" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
            </View>

            <View style={styles.macroItem}>
              <Text style={inputStyles.label}>Fats (g)</Text>
              <TextInput style={inputStyles.input} placeholder="0" value={fats} onChangeText={setFats} keyboardType="numeric" />
            </View>
          </View>

          <TouchableOpacity style={buttonStyles.primaryButton} onPress={handleAddMeal}>
            <Text style={buttonStyles.buttonText}>Log Meal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Recognition Results Dialog */}
      <FoodSelectionDialog
        visible={showRecognizedDialog}
        onClose={() => {
          setShowRecognizedDialog(false);
          setRecognizedFoods([]);
        }}
        foods={recognizedFoods.map((f) => ({ ...f, calories: 0 }))}
        onSelectFood={handleSelectRecognizedFood}
        loading={false}
        searchQuery=""
        onSearchChange={() => {}}
        onSearch={() => {}}
      />

      {/* Search Database Dialog */}
      <FoodSelectionDialog
        visible={showFoodSearch}
        onClose={() => {
          setShowFoodSearch(false);
          setSearchQuery("");
          setSearchResults([]);
        }}
        foods={searchResults}
        onSelectFood={handleSelectFood}
        loading={isSearching}
        onSearch={handleSearchFood}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
    </ScrollView>
  );
};

export default MealLogScreen;