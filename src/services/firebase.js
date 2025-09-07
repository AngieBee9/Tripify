// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Check if Firebase config is properly set
const isMissingConfig = !process.env.REACT_APP_FIREBASE_API_KEY || 
                         !process.env.REACT_APP_FIREBASE_DATABASE_URL;

if (isMissingConfig) {
  console.warn("Firebase configuration is missing or incomplete. Using local data fallback.");
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "missing-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "missing-domain",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "missing-database-url", // ⬅️ VAŽNO za RTDB
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "missing-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "missing-storage-bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "missing-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "missing-app-id"
};

let app, auth, fs, db;

try {
  app = initializeApp(firebaseConfig);

  // Auth
  auth = getAuth(app);

  // Firestore (ako ćeš ga trebati negdje drugdje)
  fs = getFirestore(app);

  // Realtime Database — NAŠI hookovi koriste ovo
  db = getDatabase(app);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Provide dummy objects to prevent errors elsewhere
  app = null;
  auth = { currentUser: null };
  fs = {};
  db = {};
}

export { app, auth, fs, db };
