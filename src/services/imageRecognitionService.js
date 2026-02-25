// Image Recognition using Supabase Edge Function (Imagga secrets hidden)
import { Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy"; // ✅ SDK54 fix
import { useStore } from "../store/useStore"; // ✅ get session token

import { searchCommonFoods, getNutritionData } from "./clarifaiService";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseConfig";

const getSupabaseAuthHeader = () => {
  const session = useStore.getState().session;
  return `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`;
};

// Recognize food from image (calls Edge Function instead of Imagga directly)
export const recognizeFood = async (imageUri) => {
  try {
    console.log("Starting image analysis...");
    console.log("Image URI:", imageUri);

    // 1) Resize & compress
    const manipulated = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2) Convert to base64
    let base64;

    if (Platform.OS === "web") {
      const blob = await (await fetch(manipulated.uri)).blob();
      base64 = await blobToBase64(blob);
    } else {
      base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: "base64",
      });
    }

    if (!base64) throw new Error("Failed to convert image to base64");

    console.log("Calling Supabase Edge Function...");

    // 3) Call Edge Function (✅ include Authorization header)
    const response = await fetch(`${SUPABASE_URL}/functions/v1/recognize-food`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: getSupabaseAuthHeader(), // ✅ FIX for 401
      },
      body: JSON.stringify({ imageBase64: base64 }),
    });

    const text = await response.text();

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      console.error("❌ Edge Function error:", text);
      throw new Error(`Edge Function error (${response.status}): ${text}`);
    }

    const data = JSON.parse(text);

    console.log("Response received");
    console.log("Tags count:", data?.result?.tags?.length || 0);

    if (data?.result?.tags) {
      const allTags = data.result.tags
        .filter((tag) => tag.confidence > 30)
        .slice(0, 10);

      const foodTags = allTags
        .filter((tag) => isFoodRelated(tag.tag.en))
        .slice(0, 5)
        .map((tag) => ({
          name: capitalizeWords(tag.tag.en),
          confidence: tag.confidence.toFixed(1),
        }));

      if (foodTags.length === 0) {
        const topTags = allTags.slice(0, 5).map((tag) => ({
          name: capitalizeWords(tag.tag.en),
          confidence: tag.confidence.toFixed(1),
        }));
        return { foods: topTags, error: null };
      }

      return { foods: foodTags, error: null };
    }

    return { foods: [], error: "No items detected in image" };
  } catch (error) {
    console.error("Recognition error:", error);
    console.error("Error message:", error.message);
    return { foods: [], error: error.message };
  }
};

// Helper: Blob -> Base64 (web)
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result?.toString().split(",")[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

// Check if tag is food-related
const isFoodRelated = (tag) => {
  const foodKeywords = [
    "food","fruit","vegetable","meat","dish","meal","cuisine",
    "bread","pizza","burger","sandwich","salad","soup","dessert",
    "rice","pasta","noodle","chicken","beef","pork","fish","seafood",
    "egg","apple","banana","orange","strawberry","grape","berry",
    "potato","tomato","carrot","broccoli","pepper","onion",
    "cheese","milk","yogurt","cream","butter",
    "cake","cookie","pastry","chocolate","candy","sweet",
    "drink","beverage","juice","coffee","tea",
    "breakfast","lunch","dinner","snack",
  ];
  const lowerTag = tag.toLowerCase();
  return foodKeywords.some((keyword) => lowerTag.includes(keyword));
};

const capitalizeWords = (str) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

// Cache for nutrition data
const nutritionCache = {};

export const getFoodNutrition = async (foodName) => {
  console.log("Getting nutrition for:", foodName);

  const key = foodName.toLowerCase();

  if (nutritionCache[key]) {
    console.log("Found in cache!");
    return { data: nutritionCache[key], error: null };
  }

  const commonResults = searchCommonFoods(foodName);
  if (commonResults.length > 0) {
    const result = commonResults[0];
    nutritionCache[key] = result;
    return { data: result, error: null };
  }

  const { data: onlineResults } = await getNutritionData(foodName);
  if (onlineResults && onlineResults.length > 0) {
    const result = onlineResults[0];
    nutritionCache[key] = result;
    return { data: result, error: null };
  }

  const result = {
    name: foodName,
    calories: 150,
    protein: 5,
    carbs: 20,
    fats: 5,
    serving: "100g (estimated)",
    estimated: true,
  };

  nutritionCache[key] = result;
  return { data: result, error: null };
};