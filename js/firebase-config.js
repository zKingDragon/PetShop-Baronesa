/**
 * Firebase Configuration for Pet Shop Baronesa
 * This file contains the Firebase configuration and initialization
 */

console.log('🔥 Carregando Firebase Config...');

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyArGX1h-b1ByHNd3cv-h_daKMl6RCl8lE0",
  authDomain: "petshop-baronesa.firebaseapp.com",
  projectId: "petshop-baronesa",
  storageBucket: "petshop-baronesa.appspot.com",
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
 * @returns {Promise<Object>}
 */
async function initializeFirebase() {
  try {
    console.log('🔄 Inicializando Firebase...');

    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig)
      console.log('✅ Firebase App inicializado');
    } else {
      app = firebase.app()
      console.log('✅ Firebase App já existe');
    }

    // Initialize Firestore FIRST (before any other operations)
    db = firebase.firestore()
    console.log('✅ Firestore inicializado');

    // Initialize Auth
    auth = firebase.auth()
    console.log('✅ Auth inicializado');

    // Try to enable offline persistence (ONLY if no other operations were performed)
    try {
      await db.enablePersistence({
        synchronizeTabs: true,
      });
      console.log('✅ Firestore persistence habilitada');
    } catch (err) {
      if (err.code === "failed-precondition") {
        console.warn("⚠️ Múltiplas abas abertas - persistência só pode ser habilitada em uma aba");
      } else if (err.code === "unimplemented") {
        console.warn("⚠️ Persistência não suportada neste navegador");
      } else if (err.message.includes('already been started')) {
        console.warn("⚠️ Firestore já foi iniciado - persistência não pode ser habilitada");
      } else {
        console.warn("⚠️ Erro ao habilitar persistência:", err);
      }
    }

    // Export to global scope for compatibility
    window.db = db
    window.auth = auth
    console.log("✅ Firebase inicializado com sucesso")
    return { app, db, auth }
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error)
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

// Initialize Firebase automatically when this script loads
initializeFirebase().catch(error => {
  console.error('❌ Falha na inicialização automática do Firebase:', error);
});

// Export functions for module usage
if (typeof window !== 'undefined') {
  window.FirebaseConfig = {
    initializeFirebase,
    getFirestore,
    getAuth,
    getApp,
    firebaseConfig
  }
}
window.auth = auth
