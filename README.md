# 🥗 Calorie Tracker App

A modern mobile calorie tracking application built with **React Native + Expo + Supabase** that helps users monitor meals, calories, nutrition, and fitness activity in real time.

---

## 📱 Demo / Install APK
Download and test the app directly:  
👉 https://expo.dev/accounts/ruzzidan/projects/CalorieTrackerApp/builds/b3c18fb4-2f32-4aa2-b73a-bd2b09dca3e1

---

## ✨ Features

### 🔐 Authentication
- Email sign up & login
- Email verification system
- Persistent login session
- Secure auth handling

---

### 🍽 Meal Tracking
- Add meals manually
- Search food database
- Scan food using AI image recognition
- Auto-fill nutrition values
- Edit or delete meals
- Daily calorie progress tracker

---

### 📊 Analytics Dashboard
- Weekly calorie chart
- Macronutrient breakdown chart
- Highest and lowest calorie day
- Average calorie summary

---

### 🏋️ Workout Logging
- Add workout sessions
- Track calories burned
- Daily workout summary

---

### 👤 Profile Management
- Personal info storage
- Custom calorie goal
- User-specific data isolation

---

## 🤖 AI Food Recognition
The app supports scanning meals using AI image detection.

Architecture:
Mobile App → Supabase Edge Function → Imagga API → Result → App

Security approach:
- API keys stored in server environment
- Secrets never exposed to frontend
- Calls routed through serverless function

---

## 🛠 Tech Stack

### Frontend
- React Native
- Expo SDK 54
- Zustand (state management)
- React Navigation
- React Native Chart Kit

### Backend
- Supabase Auth
- Supabase PostgreSQL
- Supabase Edge Functions

### External APIs
- Imagga Vision API (image recognition)
- OpenFoodFacts (nutrition data)

---

## 🔒 Security Measures
- Row Level Security (RLS) enabled
- User-scoped queries
- Protected API keys
- Secure token auth
- Server-side validation

---

## 🗄 Database Schema
Main tables:
- profiles
- meals
- workouts

All records are tied to authenticated user ID.

---

## 🚀 Local Setup

Clone project:
git clone https://github.com/YOUR_USERNAME/calorie-tracker-app.git

cd calorie-tracker-app

Install dependencies:
npm install

Start development server:
npx expo start

---

## ⚙ Environment Variables
Create `.env` file in root:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

---

## 📦 Build APK
Build Android preview:
npx eas build -p android

---

## 🧠 Learning Outcomes
This project demonstrates skills in:

- Mobile app architecture
- Full-stack integration
- Authentication systems
- API consumption
- State management
- Production builds
- Deep linking
- Serverless backend
- Secure API handling

---

## 👨‍💻 Author
**Ruzzidan**  
Full Stack Developer  
Specializing in .NET, Mobile Apps, APIs, and Database Systems

---

## 📜 License
This project is built for portfolio and demonstration purposes.