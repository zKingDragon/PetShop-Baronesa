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
            console.log('[checkPageAccess] Checking page access...');
            
            // Wait for auth system to be available
            await this.waitForAuthSystem();
            console.log('[checkPageAccess] Auth system ready');
            
            // Check if user is authenticated
            const isAuthenticated = this.isUserAuthenticated();
            console.log('[checkPageAccess] Is authenticated:', isAuthenticated);
            
            if (!isAuthenticated) {
                console.warn('[checkPageAccess] User not authenticated, redirecting to login');
                this.redirectToLogin();
                return;
            }

            // Check if user has admin privileges
            const isAdmin = await this.isUserAdmin();
            console.log('[checkPageAccess] Is admin:', isAdmin);
            
            if (!isAdmin) {
                console.warn('[checkPageAccess] User is not admin, access denied');
                this.handleAccessDenied();
                return;
            }

            console.log('[checkPageAccess] Access granted for admin user');
            this.handleAccessGranted();
        } catch (error) {
            console.error('[checkPageAccess] Error checking page access:', error);
            this.handleError(error);
        }
    }

    /**
     * Wait for auth system to be available
     */
    async waitForAuthSystem() {
        console.log('[waitForAuthSystem] Waiting for auth system...');
        let retryCount = 0;
        const maxRetries = 50; // Reduzido para 5 segundos
        
        return new Promise((resolve) => {
            const checkAuth = () => {
                // Check if our auth functions are loaded (mais importante que Firebase)
                const authFunctionsReady = typeof getCurrentUser === 'function' && 
                                         typeof getCurrentUserType === 'function' && 
                                         typeof isAdmin === 'function';
                
                // Check if Firebase is loaded (opcional para o teste)
                const firebaseReady = window.firebase && window.firebase.auth;
                
                console.log(`[waitForAuthSystem] Check ${retryCount + 1}/${maxRetries} - Auth Functions: ${authFunctionsReady}, Firebase: ${firebaseReady}`);
                
                // Continua se as funções auth estão prontas OU se atingiu o máximo de tentativas
                if (authFunctionsReady || retryCount >= maxRetries) {
                    console.log('[waitForAuthSystem] Auth system ready or timeout reached');
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
        console.log('[isUserAuthenticated] Checking authentication...');
        
        // Método 1: Use getCurrentUser function se disponível
        if (typeof getCurrentUser === 'function') {
            const user = getCurrentUser();
            if (user) {
                this.currentUser = user;
                console.log('[isUserAuthenticated] ✅ User found via getCurrentUser:', user.email);
                return true;
            }
        }

        // Método 2: Check Firebase auth directly
        if (window.firebase && window.firebase.auth) {
            const user = window.firebase.auth().currentUser;
            if (user) {
                this.currentUser = user;
                console.log('[isUserAuthenticated] ✅ User found via Firebase:', user.email);
                return true;
            }
        }

        // Método 3: Check localStorage (fallback para teste)
        const authData = localStorage.getItem('petshop_baronesa_auth');
        if (authData) {
            try {
                const userData = JSON.parse(authData);
                if (userData && userData.uid && userData.email) {
                    this.currentUser = userData;
                    console.log('[isUserAuthenticated] ✅ User found via localStorage:', userData.email);
                    return true;
                }
            } catch (error) {
                console.error('[isUserAuthenticated] Error parsing localStorage auth data:', error);
                localStorage.removeItem('petshop_baronesa_auth');
            }
        }

        console.log('[isUserAuthenticated] ❌ No authenticated user found');
        return false;
    }

    /**
     * Check if user is admin
     * @returns {Promise<boolean>} - True if admin
     */
    async isUserAdmin() {
        try {
            console.log('[isUserAdmin] Checking admin status...');
            
            // Use global isAdmin function if available
            if (typeof isAdmin === 'function') {
                const result = await isAdmin();
                console.log('[isUserAdmin] isAdmin() =>', result);
                return result;
            }

            // Use getCurrentUserType function if available
            if (typeof getCurrentUserType === 'function') {
                const userType = await getCurrentUserType();
                console.log('[isUserAdmin] getCurrentUserType() =>', userType);
                return userType === 'admin';
            }

            // Check user type directly from current user
            if (this.currentUser && typeof checkUserType === 'function') {
                const type = await checkUserType(this.currentUser.uid);
                console.log('[isUserAdmin] checkUserType:', this.currentUser.uid, '=>', type);
                return type === 'admin';
            }

            // Fallback to localStorage check
            const authData = localStorage.getItem('petshop_baronesa_auth');
            if (authData) {
                try {
                    const userData = JSON.parse(authData);
                    console.log('[isUserAdmin] localStorage type:', userData.type);
                    return userData.type === 'admin';
                } catch (error) {
                    console.error('Error parsing auth data:', error);
                }
            }

            console.log('[isUserAdmin] No admin detected');
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
        console.log('[handleAccessDenied] Acesso negado - usuário não é admin');
        
        // Remove loading message if exists
        const loadingDiv = document.getElementById('admin-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        
      
    }

    /**
     * Handle access granted
     */
    handleAccessGranted() {
        console.log('[handleAccessGranted] Acesso liberado para admin');
        // Remove loading message if exists
        const loadingDiv = document.getElementById('admin-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
                
        // Initialize admin features
        this.initializeAdminFeatures();
    }

    /**
     * Handle errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('[handleError] Erro no middleware:', error);
        
        // Remove loading message if exists
        const loadingDiv = document.getElementById('admin-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        
        // Show error message
        this.showErrorMessage(
            'Erro do Sistema',
            'Ocorreu um erro ao verificar as permissões. Tente recarregar a página.',
            () => {
                window.location.reload();
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
     * @param {string} title - Success message title
     * @param {string} message - Success message content
     */
    showSuccessMessage(title, message) {
        const successDiv = document.createElement('div');
        successDiv.id = 'admin-success';
        successDiv.innerHTML = `
            <div class="admin-success-overlay">
                <div class="admin-success-content">
                    <div class="admin-success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-success-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .admin-success-content {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                margin: 1rem;
            }
            .admin-success-icon {
                font-size: 3rem;
                color: #28a745;
                margin-bottom: 1rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(successDiv);
        
        // Remove after 2 seconds
        setTimeout(() => {
            successDiv.remove();
            style.remove();
        }, 2000);
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
