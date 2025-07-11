/**
 * Admin Middleware System for Pet Shop Baronesa
 * Provides comprehensive admin page protection and access control
 * Handles authentication, authorization, and error handling for admin routes
 */

class AdminMiddleware {
    constructor() {
        this.currentUser = null;
        this.userRole = 'guest';
        this.isInitialized = false;
        this.protectedRoutes = [
            '/admin.html',
            '/html/admin.html',
            'admin.html'
        ];
        
        this.init();
    }

    /**
     * Initialize the admin middleware
     */
    async init() {
        try {
            console.log('Initializing admin middleware...');
            
            // Check if we're on a protected page
            if (this.isProtectedRoute()) {
                await this.checkPageAccess();
            }
            
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Admin middleware initialized');
        } catch (error) {
            console.error('Error initializing admin middleware:', error);
            this.handleError(error);
        }
    }

    /**
     * Setup event listeners for auth state changes
     */
    setupEventListeners() {
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

        // Listen for page navigation
        window.addEventListener('beforeunload', () => {
            this.clearSensitiveData();
        });

        // Listen for tab focus changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
    }

    /**
     * Check if current route is protected
     * @returns {boolean} - True if protected
     */
    isProtectedRoute() {
        const currentPath = window.location.pathname;
        return this.protectedRoutes.some(route => 
            currentPath.endsWith(route) || 
            currentPath.includes(route)
        );
    }

    /**
     * Check page access permissions
     */
    async checkPageAccess() {
        try {
            console.log('Checking page access...');
            
            // Wait for auth system to be available
            await this.waitForAuthSystem();
            
            // Check if user is authenticated
            const isAuthenticated = this.isUserAuthenticated();
            if (!isAuthenticated) {
                console.warn('User not authenticated, redirecting to login');
                this.redirectToLogin();
                return;
            }

            // Check if user has admin privileges
            const isAdmin = await this.isUserAdmin();
            if (!isAdmin) {
                console.warn('User is not admin, access denied');
                this.handleAccessDenied();
                return;
            }

            console.log('Access granted for admin user');
            this.handleAccessGranted();
        } catch (error) {
            console.error('Error checking page access:', error);
            this.handleError(error);
        }
    }

    /**
     * Wait for auth system to be available
     */
    async waitForAuthSystem() {
        console.log('AdminMiddleware: Waiting for auth system...');
        let retryCount = 0;
        const maxRetries = 150; // 15 seconds max wait
        
        return new Promise((resolve) => {
            const checkAuth = () => {
                // Check if Firebase is loaded
                const firebaseReady = window.firebase && window.firebase.auth;
                
                // Check if our auth system is loaded
                const authReady = typeof window.auth !== 'undefined';
                
                console.log(`AdminMiddleware: Check ${retryCount + 1}/${maxRetries} - Firebase: ${firebaseReady}, Auth: ${authReady}`);
                
                if ((firebaseReady || authReady) || retryCount >= maxRetries) {
                    console.log('AdminMiddleware: Auth system ready or timeout reached');
                    resolve();
                    return;
                }
                
                retryCount++;
                setTimeout(checkAuth, 100);
            };
            
            checkAuth();
        });
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} - True if authenticated
     */
    isUserAuthenticated() {
        // Check Firebase auth
        if (window.firebase && window.firebase.auth) {
            const user = window.firebase.auth().currentUser;
            if (user) {
                this.currentUser = user;
                return true;
            }
        }

        // Check global auth system
        if (typeof window.auth !== 'undefined' && window.auth.isAuthenticated) {
            return window.auth.isAuthenticated();
        }

        // Check localStorage
        const authData = localStorage.getItem('petshop_baronesa_auth');
        if (authData) {
            try {
                const userData = JSON.parse(authData);
                this.currentUser = userData;
                return true;
            } catch (error) {
                console.error('Error parsing auth data:', error);
                localStorage.removeItem('petshop_baronesa_auth');
            }
        }

        return false;
    }

    /**
     * Check if user is admin
     * @returns {Promise<boolean>} - True if admin
     */
    async isUserAdmin() {
        try {
            // Use global auth system if available
            if (typeof window.auth !== 'undefined' && window.auth.isAdmin) {
                return await window.auth.isAdmin();
            }

            // Check user type directly
            if (this.currentUser && typeof window.auth !== 'undefined' && window.auth.checktype) {
                const type = await window.auth.checktype(this.currentUser.uid);
                return type === 'admin';
            }

            // Fallback to localStorage check
            const authData = localStorage.getItem('petshop_baronesa_auth');
            if (authData) {
                try {
                    const userData = JSON.parse(authData);
                    return userData.type === 'admin';
                } catch (error) {
                    console.error('Error parsing auth data:', error);
                }
            }

            return false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    /**
     * Handle authentication state changes
     * @param {Object|null} user - User object or null
     */
    async handleAuthStateChange(user) {
        this.currentUser = user;
        
        if (user) {
            // User is logged in - check role
            this.userRole = await this.determineUserRole(user);
        } else {
            // User is not logged in
            this.userRole = 'guest';
        }

        // Re-check access if on protected route
        if (this.isProtectedRoute()) {
            await this.checkPageAccess();
        }
    }

    /**
     * Determine user role
     * @param {Object} user - User object
     * @returns {Promise<string>} - User role
     */
    async determineUserRole(user) {
        if (!user) return 'guest';
        
        try {
            if (typeof window.auth !== 'undefined' && window.auth.checktype) {
                const type = await window.auth.checktype(user.uid);
                return type === 'admin' ? 'admin' : 'user';
            }
            return 'user';
        } catch (error) {
            console.error('Error determining user role:', error);
            return 'user';
        }
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        // Store the current page for redirect after login
        sessionStorage.setItem('redirect_after_login', window.location.pathname);
        
        // Determine login page path
        const loginPath = window.location.pathname.includes('/html/') ? 
            'login.html' : 'html/login.html';
        
        // Show loading message
        this.showLoadingMessage('Redirecionando para login...');
        
        // Redirect after brief delay
        setTimeout(() => {
            window.location.href = loginPath;
        }, 1000);
    }

    /**
     * Handle access denied
     */
    handleAccessDenied() {
        // Show error message
        this.showErrorMessage(
            'Acesso Negado',
            'Você não tem permissão para acessar esta página. Apenas administradores podem acessar o painel administrativo.',
            () => {
                // Redirect to home page
                window.location.href = window.location.pathname.includes('/html/') ? 
                    '../index.html' : 'index.html';
            }
        );
    }

    /**
     * Handle access granted
     */
    handleAccessGranted() {
        // Remove any loading screens
        this.hideLoadingMessage();
        
        // Show success message briefly
        this.showSuccessMessage('Acesso autorizado como administrador');
        
        // Initialize admin page features
        this.initializeAdminFeatures();
    }

    /**
     * Handle errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('Admin middleware error:', error);
        
        this.showErrorMessage(
            'Erro de Sistema',
            'Ocorreu um erro ao verificar suas permissões. Por favor, tente novamente ou faça login novamente.',
            () => {
                // Redirect to login
                this.redirectToLogin();
            }
        );
    }

    /**
     * Show loading message
     * @param {string} message - Loading message
     */
    showLoadingMessage(message) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'admin-loading';
        loadingDiv.innerHTML = `
            <div class="admin-loading-overlay">
                <div class="admin-loading-content">
                    <div class="admin-loading-spinner"></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .admin-loading-content {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            .admin-loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(loadingDiv);
    }

    /**
     * Hide loading message
     */
    hideLoadingMessage() {
        const loadingDiv = document.getElementById('admin-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    /**
     * Show error message
     * @param {string} title - Error title
     * @param {string} message - Error message
     * @param {Function} onClose - Callback when closed
     */
    showErrorMessage(title, message, onClose = null) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'admin-error';
        errorDiv.innerHTML = `
            <div class="admin-error-overlay">
                <div class="admin-error-content">
                    <div class="admin-error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <button class="admin-error-button" onclick="this.parentElement.parentElement.parentElement.remove(); ${onClose ? 'arguments.callee.onClose()' : ''}">
                        Entendi
                    </button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-error-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .admin-error-content {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                margin: 1rem;
            }
            .admin-error-icon {
                font-size: 3rem;
                color: #dc3545;
                margin-bottom: 1rem;
            }
            .admin-error-button {
                background: #dc3545;
                color: white;
                border: none;
                padding: 0.5rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
                margin-top: 1rem;
            }
            .admin-error-button:hover {
                background: #c82333;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(errorDiv);
        
        // Set callback
        if (onClose) {
            errorDiv.querySelector('.admin-error-button').onClose = onClose;
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.id = 'admin-success';
        successDiv.innerHTML = `
            <div class="admin-success-notification">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-success-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    /**
     * Initialize admin features
     */
    initializeAdminFeatures() {
        // Add admin-specific event listeners
        this.setupAdminEventListeners();
        
        // Initialize admin UI enhancements
        this.enhanceAdminUI();
    }

    /**
     * Setup admin-specific event listeners
     */
    setupAdminEventListeners() {
        // Add keyboard shortcuts for admin actions
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey) {
                switch(e.key) {
                    case 'p':
                        e.preventDefault();
                        this.quickAddProduct();
                        break;
                    case 'u':
                        e.preventDefault();
                        this.quickUserManagement();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showAdminHelp();
                        break;
                }
            }
        });

        // Add context menu for admin actions
        document.addEventListener('contextmenu', (e) => {
            if (this.userRole === 'admin') {
                // Add admin context menu
                this.showAdminContextMenu(e);
            }
        });
    }

    /**
     * Enhance admin UI
     */
    enhanceAdminUI() {
        // Add admin badge to header
        const header = document.querySelector('header');
        if (header) {
            const adminBadge = document.createElement('div');
            adminBadge.className = 'admin-badge';
            adminBadge.innerHTML = '<i class="fas fa-shield-alt"></i> Admin';
            header.appendChild(adminBadge);
        }

        // Add admin quick actions
        this.addAdminQuickActions();
    }

    /**
     * Add admin quick actions
     */
    addAdminQuickActions() {
        const quickActions = document.createElement('div');
        quickActions.id = 'admin-quick-actions';
        quickActions.innerHTML = `
            <div class="admin-quick-actions-panel">
                <button onclick="window.adminMiddleware.quickAddProduct()">
                    <i class="fas fa-plus"></i> Produto
                </button>
                <button onclick="window.adminMiddleware.quickUserManagement()">
                    <i class="fas fa-users"></i> Usuários
                </button>
                <button onclick="window.adminMiddleware.showAdminHelp()">
                    <i class="fas fa-question"></i> Ajuda
                </button>
            </div>
        `;
        
        document.body.appendChild(quickActions);
    }

    /**
     * Quick add product
     */
    quickAddProduct() {
        // Navigate to product add section
        window.location.hash = '#add-product';
    }

    /**
     * Quick user management
     */
    quickUserManagement() {
        // Navigate to user management section
        window.location.hash = '#user-management';
    }

    /**
     * Show admin help
     */
    showAdminHelp() {
        alert('Atalhos do Admin:\nCtrl+Alt+P: Adicionar Produto\nCtrl+Alt+U: Gerenciar Usuários\nCtrl+Alt+H: Mostrar Ajuda');
    }

    /**
     * Show admin context menu
     * @param {Event} e - Context menu event
     */
    showAdminContextMenu(e) {
        // Implementation for admin context menu
        console.log('Admin context menu at:', e.clientX, e.clientY);
    }

    /**
     * Clear sensitive data
     */
    clearSensitiveData() {
        // Clear any sensitive data when page is hidden or unloaded
        console.log('Clearing sensitive data...');
    }

    /**
     * Handle page hidden
     */
    onPageHidden() {
        console.log('Admin page hidden');
    }

    /**
     * Handle page visible
     */
    onPageVisible() {
        console.log('Admin page visible');
        // Re-check permissions when page becomes visible
        if (this.isProtectedRoute()) {
            this.checkPageAccess();
        }
    }

    /**
     * Protect admin page function (for external use)
     * @returns {Promise<boolean>} - True if access granted
     */
    static async protectAdminPage() {
        const middleware = new AdminMiddleware();
        await middleware.init();
        return middleware.userRole === 'admin';
    }

    /**
     * Check if current user has admin access
     * @returns {Promise<boolean>} - True if admin
     */
    async hasAdminAccess() {
        try {
            const isAuth = this.isUserAuthenticated();
            if (!isAuth) return false;
            
            const isAdmin = await this.isUserAdmin();
            return isAdmin;
        } catch (error) {
            console.error('Error checking admin access:', error);
            return false;
        }
    }
}

// Initialize admin middleware when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.adminMiddleware = new AdminMiddleware();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminMiddleware;
}

// Export protectAdminPage function globally
window.protectAdminPage = AdminMiddleware.protectAdminPage;
