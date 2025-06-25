/**
 * Firebase Configuration for Pet Shop Baronesa
 * This file contains the Firebase configuration and initialization
 */
console.log('firebase:', firebase); 
// Firebase configuration object
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyArGX1h-b1ByHNd3cv-h_daKMl6RCl8lE0",
  authDomain: "petshop-baronesa.firebaseapp.com",
  projectId: "petshop-baronesa",
  storageBucket: "petshop-baronesa.appspot.com", // Corrija para .appspot.com
  messagingSenderId: "405139802386",
  appId: "1:405139802386:web:f40693472a4d182d0d4bcb",
  measurementId: "G-QG8STMJGQQ"
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
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig)
    } else {
      app = firebase.app() // if already initialized, use that one
    }

    // Initialize Firestore
    db = firebase.firestore()

    // Initialize Auth
    auth = firebase.auth()

    // Enable offline persistence (opcional para Auth, mas mantido para Firestore)
    if (db && db.enablePersistence) {
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
    }

    window.db = db
    window.auth = auth
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

window.db = db
window.auth = auth
