import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import MealLogScreen from '../screens/MealLogScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import MealHistoryScreen from '../screens/MealHistoryScreen';
import EmailConfirmedScreen from "../screens/EmailConfirmedScreen";

// Import colors
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Auth Stack (for users who are NOT logged in)
const AuthStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false  // Make sure this is boolean
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="EmailConfirmed" component={EmailConfirmedScreen} />
    </Stack.Navigator>
  );
};

// Main App Tabs (for logged in users)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Meals") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else if (route.name === "Workout") {
            iconName = focused ? "barbell" : "barbell-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        // IMPORTANT: Explicitly set header shown to true (boolean)
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="Meals"
        component={MealLogScreen}
        options={{ title: "Log Meal" }}
      />
      <Tab.Screen
        name="History"
        component={MealHistoryScreen}
        options={{ title: "History" }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ title: "Workouts" }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: "Analytics" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const linking = {
  prefixes: ["calorietracker://"],
  config: {
    screens: {
      Login: "login",
      EmailConfirmed: "email-confirmed",
      SignUp: "signup",
    },
  },
};

// Root Navigation - switches between Auth and Main based on login status
const AppNavigation = ({ isAuthenticated }) => {
  // Convert to boolean
  const isAuth = Boolean(isAuthenticated);
  
  return (
    <NavigationContainer linking={linking}>
      {isAuth ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigation;