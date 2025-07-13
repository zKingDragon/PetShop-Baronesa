/**
 * Authentication Service for Pet Shop Baronesa
 * This service handles authentication for admin functions
 */

class AuthService {
  constructor() {
    this.auth = null
    this.currentUser = null
    this.initialized = false
    this.authStateListeners = []
  }

  /**
   * Inicializa o serviço com a instância do Firebase Auth
   */
  initialize(auth) {
    this.auth = auth
    this.initialized = true
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user
      this._notifyAuthStateListeners(user)
    })
  }

  /**
   * Checks if the service is initialized
   * @private
   */
  _checkInitialized() {
    if (!this.initialized) {
      throw new Error("AuthService not initialized. Call initialize() first.")
    }
  }

  /**
   * Notifies all auth state listeners
   * @param {firebase.User|null} user - Current user
   * @private
   */
  _notifyAuthStateListeners(user) {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(user)
      } catch (error) {
        console.error("Error in auth state listener:", error)
      }
    })
  }

  /**
   * Adds an auth state change listener
   * @param {Function} listener - Listener function
   * @returns {Function} - Unsubscribe function
   */
  onAuthStateChanged(listener) {
    this.authStateListeners.push(listener)

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  /**
   * Signs in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<firebase.User>} - User object
   */
  async signInWithEmailAndPassword(email, password) {
    this._checkInitialized()

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password)
      console.log("User signed in successfully")
      return userCredential.user
    } catch (error) {
      console.error("Error signing in:", error)
      throw new Error(`Failed to sign in: ${error.message}`)
    }
  }

  /**
   * Signs out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    this._checkInitialized()

    try {
      await this.auth.signOut()
      console.log("User signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
      throw new Error(`Failed to sign out: ${error.message}`)
    }
  }

  /**
   * Gets the current user
   * @returns {firebase.User|null} - Current user or null
   */
  getCurrentUser() {
    return this.currentUser
  }

  /**
   * Checks if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return !!this.currentUser
  }

  /**
   * Checks if current user is admin
   * @returns {Promise<boolean>} - True if user is admin
   */
  async isAdmin() {
    if (!this.currentUser) {
      return false
    }

    try {
      // Get user's custom claims
      const idTokenResult = await this.currentUser.getIdTokenResult()
      return !!idTokenResult.claims.admin
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

  /**
   * Gets user role
   * @returns {Promise<string>} - User role: 'guest' or 'admin'
   */
  async getUserRole() {
    if (!this.currentUser) {
      return 'guest'
    }

    try {
      const idTokenResult = await this.currentUser.getIdTokenResult()
      if (idTokenResult.claims.admin) {
        return 'admin'
      }
      return 'guest'
    } catch (error) {
      console.error("Error getting user role:", error)
      return 'guest'
    }
  }

  /**
   * Checks if user has required role
   * @param {string} requiredRole - Required role: 'guest' or 'admin'
   * @returns {Promise<boolean>} - True if user has required role
   */
  async hasRole(requiredRole) {
    const userRole = await this.getUserRole()
    
    if (requiredRole === 'user') {
      return userRole === 'admin' // Only admin can access user-restricted content
    }
    
    if (requiredRole === 'admin') {
      return userRole === 'admin'
    }
    
    return true // For 'guest' or any other role
  }

  /**
   * Gets user display name
   * @returns {Promise<string>} - User display name
   */
  async getUserDisplayName() {
    if (!this.currentUser) {
      return 'Visitante'
    }

    const role = await this.getUserRole()
    if (role === 'admin') {
      return 'Administrador'
    }

    return this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'Usuário'
  }

  /**
   * Creates a new user account
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} displayName - User display name
   * @returns {Promise<firebase.User>} - Created user
   */
  async createUserWithEmailAndPassword(email, password, displayName) {
    this._checkInitialized()

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password)
      
      // Update display name
      if (displayName) {
        await userCredential.user.updateProfile({
          displayName: displayName
        })
      }
      
      console.log("User created successfully")
      return userCredential.user
    } catch (error) {
      console.error("Error creating user:", error)
      throw new Error(`Failed to create user: ${error.message}`)
    }
  }

  /**
   * Requires admin authentication
   * @throws {Error} - If user is not admin
   */
  async requireAdmin() {
    if (!this.isAuthenticated()) {
      throw new Error("Authentication required")
    }

    const isAdmin = await this.isAdmin()
    if (!isAdmin) {
      throw new Error("Admin privileges required")
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();

// Inicializa automaticamente com Firebase quando disponível
if (typeof firebase !== 'undefined' && firebase.auth) {
  authService.initialize(firebase.auth());
} else {
  // Aguarda Firebase estar disponível
  const checkFirebase = () => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      authService.initialize(firebase.auth());
      console.log('AuthService initialized automatically');
    } else {
      setTimeout(checkFirebase, 100);
    }
  };
  checkFirebase();
}

// Export for use in other modules
window.AuthService = authService;
