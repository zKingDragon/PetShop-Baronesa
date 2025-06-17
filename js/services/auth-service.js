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
   * Initializes the service with Firebase Auth instance
   * @param {firebase.auth.Auth} auth - Auth instance
   */
  initialize(auth) {
    this.auth = auth
    this.initialized = true

    // Listen for auth state changes
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
const authService = new AuthService()

// Export for use in other modules
window.AuthService = authService
