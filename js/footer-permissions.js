/**
 * Footer Permission System for Pet Shop Baronesa
 * Manages footer links visibility based on user authentication and roles
 * Updated to use database-driven permissions
 */

class FooterPermissionManager {
    constructor() {
        this.currentUser = null;
        this.userRole = 'guest'; // guest, user, admin
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the footer permission manager
     */
    async init() {
        this.updateCurrentYear();
        this.setupEventListeners();
        await this.checkAuthenticationState();
        this.isInitialized = true;
    }

    /**
     * Update the current year in the footer
     */
    updateCurrentYear() {
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
    }

    /**
     * Setup event listeners for footer links
     */
    setupEventListeners() {
        // Logout link in footer
        const footerLogoutLink = document.getElementById('footerLogoutLink');
        if (footerLogoutLink) {
            footerLogoutLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.logout();
            });
        }

        // User profile link
        const userProfileLink = document.getElementById('userProfileLink');
        if (userProfileLink) {
            userProfileLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToUserProfile();
            });
        }

        // Listen for authentication state changes
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().onAuthStateChanged(async (user) => {
                await this.handleAuthStateChange(user);
            });
        }

        // Listen for custom auth events
        document.addEventListener('authStateChanged', async (event) => {
            await this.handleAuthStateChange(event.detail.user);
        });
    }

    /**
     * Check current authentication state
     */
    async checkAuthenticationState() {
        try {
            // Wait for auth system to be available
            if (typeof window.auth === 'undefined') {
                setTimeout(() => this.checkAuthenticationState(), 100);
                return;
            }

            // Check Firebase auth if available
            if (typeof firebase !== 'undefined' && firebase.auth) {
                const user = firebase.auth().currentUser;
                if (user) {
                    await this.handleAuthStateChange(user);
                    return;
                }
            }

            // Check using global auth system (if available)
            if (window.auth && typeof window.auth.currentUser !== 'undefined') {
                const currentUser = window.auth.currentUser;
                if (currentUser) {
                    await this.handleAuthStateChange(currentUser);
                    return;
                }
            }

            // No authenticated user
            await this.handleAuthStateChange(null);
        } catch (error) {
            console.error('Error checking authentication state:', error);
            await this.handleAuthStateChange(null);
        }
    }

    /**
     * Handle authentication state changes
     * @param {Object|null} user - User object or null
     */
    async handleAuthStateChange(user) {
        this.currentUser = user;
        
        if (user) {
            // User is logged in - get role from database
            this.userRole = await this.determineUserRole(user);
            this.updateFooterForLoggedInUser(user);
        } else {
            // User is not logged in
            this.userRole = 'guest';
            this.updateFooterForGuest();
        }

        this.updateFooterVisibility();
    }

    /**
     * Determine user role based on user data (using database)
     * @param {Object} user - User object
     * @returns {Promise<string>} - User role (guest, user, admin)
     */
    async determineUserRole(user) {
        if (!user) return 'guest';
        
        try {
            // Use the global auth system to check user type
            if (typeof window.auth !== 'undefined' && window.auth.checkUserType) {
                const userType = await window.auth.checkUserType(user.uid);
                return userType === 'admin' ? 'admin' : 'user';
            }

            // Fallback to getCurrentUserType if available
            if (typeof window.auth !== 'undefined' && window.auth.getCurrentUserType) {
                const userType = await window.auth.getCurrentUserType();
                return userType === 'admin' ? 'admin' : 'user';
            }

            console.warn('Auth system not available, defaulting to user role');
            return 'user';
        } catch (error) {
            console.error('Error determining user role:', error);
            return 'user';
        }
    }

    /**
     * Update footer for logged in user
     * @param {Object} user - User object
     */
    async updateFooterForLoggedInUser(user) {
        const footerUserName = document.getElementById('footerUserName');
        if (footerUserName) {
            let displayName = user.displayName || user.name || user.email || 'Usuário';
            
            // Add admin indicator if user is admin
            if (this.userRole === 'admin') {
                displayName = `<i class="fas fa-crown" style="color: gold; margin-right: 5px;"></i>${displayName}`;
            }
            
            footerUserName.innerHTML = displayName;
        }
    }

    /**
     * Update footer for guest user
     */
    updateFooterForGuest() {
        // Reset any user-specific data
        const footerUserName = document.getElementById('footerUserName');
        if (footerUserName) {
            footerUserName.textContent = 'Minha Conta';
        }
    }

    /**
     * Update footer visibility based on user role
     */
    updateFooterVisibility() {
        // Hide all permission-based elements first
        this.hideAllPermissionElements();

        // Show elements based on current role
        switch (this.userRole) {
            case 'guest':
                this.showElements('.guest-only');
                break;
            case 'user':
                this.showElements('.user-only');
                break;
            case 'admin':
                this.showElements('.user-only');
                this.showElements('.admin-only');
                break;
        }
    }

    /**
     * Hide all permission-based elements
     */
    hideAllPermissionElements() {
        const elements = document.querySelectorAll('.guest-only, .user-only, .admin-only');
        elements.forEach(element => {
            element.style.display = 'none';
        });
    }

    /**
     * Show elements with specific class
     * @param {string} selector - CSS selector for elements to show
     */
    showElements(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = '';
        });
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Use the global auth system logout if available
            if (typeof window.auth !== 'undefined' && window.auth.logout) {
                await window.auth.logout();
                this.showNotification('Logout realizado com sucesso!', 'success');
                return;
            }

            // Fallback to Firebase logout
            if (window.firebase && window.firebase.auth) {
                await window.firebase.auth().signOut();
                console.log('User signed out from Firebase');
            }

            // Remove from localStorage
            localStorage.removeItem('petshop_baronesa_auth');
            
            // Update UI
            await this.handleAuthStateChange(null);
            
            // Redirect to home if on protected page
            const protectedPages = ['/admin.html', '/promocoes.html'];
            const currentPath = window.location.pathname;
            
            if (protectedPages.some(page => currentPath.endsWith(page))) {
                window.location.href = '../index.html';
            }
            
            // Show success message
            this.showNotification('Logout realizado com sucesso!', 'success');
        } catch (error) {
            console.error('Error during logout:', error);
            this.showNotification('Erro ao fazer logout', 'error');
        }
    }

    /**
     * Go to user profile
     */
    goToUserProfile() {
        // You can implement user profile page navigation here
        console.log('Navigate to user profile');
        // For now, just show a message
        this.showNotification('Funcionalidade de perfil em desenvolvimento', 'info');
    }

    /**
     * Show notification message
     * @param {string} message - Message to show
     * @param {string} type - Type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `footer-notification footer-notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                type === 'error' ? 'exclamation-triangle' : 
                                'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get current user role
     * @returns {string} - Current user role
     */
    getCurrentUserRole() {
        return this.userRole;
    }

    /**
     * Check if user has specific permission
     * @param {string} permission - Permission to check (guest, user, admin)
     * @returns {Promise<boolean>} - Whether user has permission
     */
    async hasPermission(permission) {
        // Ensure we have the latest user role
        if (this.currentUser) {
            this.userRole = await this.determineUserRole(this.currentUser);
        }
        
        switch (permission) {
            case 'guest':
                return this.userRole === 'guest';
            case 'user':
                return this.userRole === 'user' || this.userRole === 'admin';
            case 'admin':
                return this.userRole === 'admin';
            default:
                return false;
        }
    }

    /**
     * Add custom admin email (deprecated - using database now)
     * @param {string} email - Admin email to add
     */
    addAdminEmail(email) {
        console.warn('addAdminEmail is deprecated. Admin status is now managed in the database.');
    }

    /**
     * Remove custom admin email (deprecated - using database now)
     * @param {string} email - Admin email to remove
     */
    removeAdminEmail(email) {
        console.warn('removeAdminEmail is deprecated. Admin status is now managed in the database.');
    }

    /**
     * Get user type from database
     * @returns {Promise<string>} - User type
     */
    async getUserType() {
        if (!this.currentUser) return 'guest';
        
        try {
            if (typeof window.auth !== 'undefined' && window.auth.checkUserType) {
                return await window.auth.checkUserType(this.currentUser.uid);
            }
            return 'user';
        } catch (error) {
            console.error('Error getting user type:', error);
            return 'user';
        }
    }

    /**
     * Check if current user is admin
     * @returns {Promise<boolean>} - True if admin
     */
    async isAdmin() {
        return await this.hasPermission('admin');
    }

    /**
     * Check if current user is logged in
     * @returns {boolean} - True if logged in
     */
    isLoggedIn() {
        return this.userRole !== 'guest';
    }
}

// Initialize footer permission manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.footerPermissionManager = new FooterPermissionManager();
    
    // Wait for Firebase to be available
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait
    
    const waitForAuth = async () => {
        if ((typeof firebase !== 'undefined' && firebase.auth) || retryCount >= maxRetries) {
            await window.footerPermissionManager.init();
            return;
        }
        
        retryCount++;
        setTimeout(waitForAuth, 100);
    };
    
    await waitForAuth();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterPermissionManager;
}
