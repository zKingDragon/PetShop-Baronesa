/**
 * Firebase Configuration for Pet Shop Baronesa
 * This file contains the Firebase configuration and initialization
 */



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

// Flag para controlar tentativas de persistência
let persistenceAttempted = false;

/**
 * Limpa possíveis conexões antigas do IndexedDB
 * @returns {Promise<void>}
 */
async function resetIndexedDB() {
  return new Promise((resolve) => {
    try {
      // Tentar limpar IndexedDB relacionado ao Firestore
      const request = indexedDB.deleteDatabase('firebaseLocalStorageDb');
      
      request.onsuccess = function() {

        resolve();
      };
      
      request.onerror = function() {
        console.warn('⚠️ Erro ao limpar IndexedDB');
        resolve(); // Continuar mesmo com erro
      };
      
      request.onblocked = function() {
        console.warn('⚠️ IndexedDB bloqueado por outra conexão');
        resolve(); // Continuar mesmo com erro
      };
      
      // Timeout de segurança
      setTimeout(() => {
        resolve();
      }, 1000);
    } catch (error) {
      console.warn('⚠️ Erro ao tentar limpar IndexedDB:', error);
      resolve(); // Continuar mesmo com erro
    }
  });
}

/**
 * Initializes Firebase services with retry mechanism
 * @returns {Promise<Object>}
 */
async function initializeFirebase(forceClearIndexedDB = false) {
  try {

    
    // Limpar IndexedDB se forçado (usar com cuidado)
    if (forceClearIndexedDB) {
      await resetIndexedDB();
    }
    
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig)

    } else {
      app = firebase.app()

    }

    // Initialize Firestore FIRST (before any other operations)
    db = firebase.firestore()


    // Initialize Auth
    auth = firebase.auth()


    // Tenta habilitar persistência apenas se ainda não tentou
    if (!persistenceAttempted) {
      persistenceAttempted = true;
      
      try {
    // Usar cache apenas, sem persistência completa
    await db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        // Melhora compatibilidade de rede (proxies/firewalls, ad-blockers, ambientes corporativos)
        experimentalAutoDetectLongPolling: true,
        useFetchStreams: false,
        
        // ADICIONE ESTA LINHA PARA RESOLVER O AVISO
        merge: true 
        
        // Se necessário, force o long-polling sempre (menos eficiente):
        // experimentalForceLongPolling: true
    });

        
        // Tentar persistência de forma assíncrona
        setTimeout(async () => {
          try {
            await db.enablePersistence({
              synchronizeTabs: true,
            });

          } catch (err) {
            if (err.code === "failed-precondition") {
              // Suprimir o aviso de múltiplas abas no console

            } else {
              console.warn("⚠️ Erro ao habilitar persistência:", err);
            }
          }
        }, 1000);
      } catch (err) {
        console.warn("⚠️ Erro ao configurar cache:", err);
      }
    } else {

    }

    // Export to global scope for compatibility
    window.db = db
    window.auth = auth

    return { app, db, auth }
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error)
    throw error
  }
}

/**
 * Configura a função de filtragem para o console
 * Suprime avisos específicos do Firebase
 */
function setupConsoleFilter() {
  try {
    // Filtrar avisos específicos sobre persistência
    const originalWarn = console.warn;
    console.warn = function(...args) {
      // Não mostrar aviso específico de persistência
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('Persistence can only be enabled') || 
           args[0].includes('Múltiplas abas abertas'))) {
        return; // Suprimir este aviso específico
      }
      // Passar outros avisos normalmente
      originalWarn.apply(console, args);
    };
    

  } catch (error) {
    console.error('❌ Erro ao configurar filtro de console:', error);
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

/**
 * Limpa o cache e reinicia o Firebase
 * Usar apenas em caso de problemas
 */
async function clearCacheAndReinitialize() {

  
  // Tentar desconectar primeiro
  try {
    if (db) {
      // Terminar todas as conexões do Firestore
      db.terminate && db.terminate();

    }
  } catch (error) {
    console.warn('⚠️ Erro ao terminar Firestore:', error);
  }
  
  // Limpar auth
  try {
    if (auth) {
      auth.signOut().catch(e => console.warn('⚠️ Erro ao fazer logout:', e));
    }
  } catch (error) {
    console.warn('⚠️ Erro ao fazer logout:', error);
  }
  
  // Limpar variáveis
  app = null;
  db = null;
  auth = null;
  
  // Resetar IndexedDB
  await resetIndexedDB();
  
  // Reinicializar com flag de limpeza
  return initializeFirebase(true);
}

// Configurar filtro de console para suprimir avisos repetitivos
setupConsoleFilter();

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
    firebaseConfig,
    clearCacheAndReinitialize // Nova função para emergências
  }
}

// Compatibilidade
window.auth = auth;