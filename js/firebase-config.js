/**
 * Firebase Configuration for Pet Shop Baronesa
 * This file contains the Firebase configuration and initialization
 */

// Import Firebase SDK
import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

// Firebase configuration object
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
}

// Initialize Firebase
let app
let db
let auth

/**
 * Initializes Firebase services
 * @returns {Promise<void>}
 */
async function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (typeof firebase === "undefined") {
      throw new Error("Firebase SDK not loaded. Please include Firebase scripts in your HTML.")
    }

    // Initialize Firebase app
    app = firebase.initializeApp(firebaseConfig)

    // Initialize Firestore
    db = firebase.firestore()

    // Initialize Auth
    auth = firebase.auth()

    // Enable offline persistence
    await db
      .enablePersistence({
        synchronizeTabs: true,
      })
      .catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
        } else if (err.code === "unimplemented") {
          console.warn("The current browser does not support all of the features required to enable persistence")
        }
      })

    console.log("Firebase initialized successfully")
    return { app, db, auth }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
    throw error
  }
}

/**
 * Gets the Firestore database instance
 * @returns {firebase.firestore.Firestore}
 */
function getFirestore() {
  if (!db) {
    throw new Error("Firestore not initialized. Call initializeFirebase() first.")
  }
  return db
}

/**
 * Gets the Firebase Auth instance
 * @returns {firebase.auth.Auth}
 */
function getAuth() {
  if (!auth) {
    throw new Error("Auth not initialized. Call initializeFirebase() first.")
  }
  return auth
}

/**
 * Gets the Firebase App instance
 * @returns {firebase.app.App}
 */
function getApp() {
  if (!app) {
    throw new Error("Firebase app not initialized. Call initializeFirebase() first.")
  }
  return app
}

// Export functions for use in other modules
window.FirebaseConfig = {
  initializeFirebase,
  getFirestore,
  getAuth,
  getApp,
}
